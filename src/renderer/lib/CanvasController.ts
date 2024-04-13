import { Scene } from "src/scene";
import { limit } from "./utils";
import { Dim, Pos } from "src/coordinate";
import { GluObject } from "src/glunode";
import { nanoid } from "nanoid";
import { accentColor } from "./theme";

export default class CanvasController {
    private ctx: CanvasRenderingContext2D | null = null;
    private scene: Scene | null = null;
    private isMovingObject = false;

    private updateScene: () => void = () => {};

    initialize(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.ctx.canvas.onpointerdown = this.onPointerDown.bind(this);
        this.ctx.canvas.onpointerup = this.onPointerUp.bind(this);
        this.ctx.canvas.onwheel = this.onWheel.bind(this);
        this.onResize();
        window.requestAnimationFrame(this.render.bind(this));
        window.addEventListener("paste", this.onPaste.bind(this));
        window.addEventListener("resize", this.onResize.bind(this));
    }

    onSceneUpdate(handler: () => void) {
        this.updateScene = handler;
    }

    setScene(scene: Scene | null) {
        this.scene = scene;
    }

    private render() {
        if (!this.ctx) return;
        if (!this.scene) {
            window.requestAnimationFrame(this.render.bind(this));
            return;
        }

        const canvas = this.ctx.canvas;

        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx.save();

        this.ctx.setTransform(
            this.scene.zoom,
            0,
            0,
            this.scene.zoom,
            -0.5 * this.ctx.canvas.width * (this.scene.zoom - 1),
            -0.5 * this.ctx.canvas.height * (this.scene.zoom - 1),
        );

        const objects = this.scene.getNodesInRect({
            minX: this.scene.viewPos.x - canvas.width / 2 / this.scene.zoom,
            minY: this.scene.viewPos.y - canvas.height / 2 / this.scene.zoom,
            maxX: this.scene.viewPos.x + canvas.width / 2 / this.scene.zoom,
            maxY: this.scene.viewPos.y + canvas.height / 2 / this.scene.zoom,
        });

        if (this.isMovingObject) {
            for (const node of this.scene.getSelectedNodes()) {
                if (node instanceof GluObject) {
                    objects.push(node);
                }
            }
        }

        objects.sort((a, b) => a.depth() - b.depth());

        for (const node of objects) {
            node.render(this.ctx, this.scene.viewPos);
        }

        const dpr = window.devicePixelRatio;
        for (const node of this.scene.getSelectedNodes()) {
            const x =
                this.ctx.canvas.width / 2 - this.scene.viewPos.x + node.pos.x;
            const y =
                this.ctx.canvas.height / 2 - this.scene.viewPos.y + node.pos.y;
            this.ctx.lineWidth = (5 * dpr) / this.scene.zoom;
            this.ctx.strokeStyle = accentColor;
            this.ctx.beginPath();
            this.ctx.roundRect(
                x - (5 * dpr) / this.scene.zoom,
                y - (5 * dpr) / this.scene.zoom,
                node.dim.width + (10 * dpr) / this.scene.zoom,
                node.dim.height + (10 * dpr) / this.scene.zoom,
                (5 * dpr) / this.scene.zoom,
            );
            this.ctx.stroke();
        }

        this.ctx.restore();
        window.requestAnimationFrame(this.render.bind(this));
    }

    private onResize() {
        if (this.ctx) {
            const dpr = window.devicePixelRatio;
            this.ctx.canvas.width = this.ctx.canvas.offsetWidth * dpr;
            this.ctx.canvas.height = this.ctx.canvas.offsetHeight * dpr;
        }
    }

    private onPointerDown(e: PointerEvent) {
        if (!this.scene) return;

        if (e.button === 0) {
            const dpr = window.devicePixelRatio;
            const x =
                this.scene.viewPos.x +
                (e.offsetX * dpr - this.ctx!.canvas.width / 2) /
                    this.scene.zoom;
            const y =
                this.scene.viewPos.y +
                (e.offsetY * dpr - this.ctx!.canvas.height / 2) /
                    this.scene.zoom;
            const objects = this.scene.getNodesInRect({
                minX: x,
                minY: y,
                maxX: x,
                maxY: y,
            });
            objects.sort((a, b) => a.depth() - b.depth());
            if (objects.length > 0) {
                const topNode = objects[objects.length - 1];
                if (e.shiftKey) {
                    if (this.scene.isNodeSelected(topNode)) {
                        this.scene.unselectNode(topNode);
                    } else {
                        this.scene.selectNode(topNode);
                    }
                } else {
                    if (!this.scene.isNodeSelected(topNode)) {
                        this.scene.unselectAllNodes();
                        this.scene.selectNode(topNode);
                    }

                    for (const node of this.scene.getSelectedNodes()) {
                        if (node instanceof GluObject) {
                            this.scene.unregisterNode(node);
                        }
                    }
                    this.isMovingObject = true;
                    this.ctx!.canvas.onpointermove = this.moveObject.bind(this);
                }
            } else {
                if (this.scene.hasSelectNode()) {
                    this.scene.unselectAllNodes();
                }
            }
            this.updateScene();
        } else if (e.button === 1) {
            this.ctx!.canvas.onpointermove = this.moveCanvas.bind(this);
            try {
                this.ctx!.canvas.requestPointerLock();
            } catch {
                /* empty */
            }
        }
    }

    private moveCanvas(e: PointerEvent) {
        if (!this.scene) return;

        const dpr = window.devicePixelRatio;

        if (e.metaKey) {
            this.scene.zoom = limit(
                this.scene.zoom - e.movementY * 0.005,
                0.1,
                10,
            );
        } else {
            this.scene.viewPos = new Pos(
                this.scene.viewPos.x - (e.movementX * dpr) / this.scene.zoom,
                this.scene.viewPos.y - (e.movementY * dpr) / this.scene.zoom,
            );
        }

        this.updateScene();
    }

    private moveObject(e: PointerEvent) {
        if (!this.scene) return;

        const dpr = window.devicePixelRatio;
        for (const node of this.scene.getSelectedNodes()) {
            node.pos = node.pos.offset(
                (e.movementX * dpr) / this.scene.zoom,
                (e.movementY * dpr) / this.scene.zoom,
            );
        }
    }

    private onPaste(e: ClipboardEvent) {
        if (!this.scene || !e.clipboardData) return;

        const items = e.clipboardData.items;
        for (const item of items) {
            if (item.kind === "file") {
                const blob = item.getAsFile();
                if (blob) {
                    this.scene.root.addChild(
                        new GluObject(
                            "image",
                            nanoid(),
                            "Image",
                            this.scene.viewPos.clone(),
                            new Dim(0, 0),
                            blob,
                        ),
                    );
                    this.updateScene();
                }
            }
        }
    }

    private onPointerUp(e: PointerEvent) {
        if (!this.scene) return;

        this.ctx!.canvas.onpointermove = null;
        if (e.button === 0 && this.isMovingObject) {
            for (const node of this.scene.getSelectedNodes()) {
                if (node instanceof GluObject) {
                    this.scene.registerNode(node);
                }
            }
            this.updateScene();
            this.isMovingObject = false;
        } else if (e.button === 1) {
            document.exitPointerLock();
        }
    }

    private onWheel(e: WheelEvent) {
        if (!this.scene) return;

        if (e.ctrlKey) {
            this.scene.zoom = limit(
                this.scene.zoom - e.deltaY * 0.005,
                0.1,
                10,
            );
        } else {
            this.scene.viewPos = new Pos(
                this.scene.viewPos.x + e.deltaX / this.scene.zoom,
                this.scene.viewPos.y + e.deltaY / this.scene.zoom,
            );
        }

        this.updateScene();
    }
}
