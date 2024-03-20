import { SceneState } from "src/scene";
import { limit } from "./utils";
import { Dim, Pos } from "src/coordinate";
import { GluObject } from "src/glunode";
import { nanoid } from "nanoid";

export default class CanvasController {
    private ctx: CanvasRenderingContext2D | null = null;
    private selectNodeIds: Set<string> = new Set();
    private updateScene: () => void;
    private setSelectNodeIds: (selectNodeIds: Set<string>) => void;
    private isMovingObject = false;

    private scene: SceneState | null = null;

    constructor(
        onSceneUpdate: () => void,
        onSelectNodeIdsUpdate: (selectNodeIds: Set<string>) => void,
    ) {
        this.updateScene = onSceneUpdate;
        this.setSelectNodeIds = onSelectNodeIdsUpdate;
    }

    setCtx(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.ctx.canvas.onpointerdown = this.onPointerDown.bind(this);
        this.ctx.canvas.onpointerup = this.onPointerUp.bind(this);
        this.ctx.canvas.onwheel = this.onWheel.bind(this);
        this.resize();
        window.requestAnimationFrame(this.render.bind(this));
        window.addEventListener("paste", this.onPaste.bind(this));
        window.addEventListener("resize", this.resize.bind(this));
    }

    updateSelectNodeIds(selectNodeIds: Set<string>) {
        this.selectNodeIds = selectNodeIds;
    }

    setScene(scene: SceneState | null) {
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

        const nodes = this.scene.rTree.search({
            minX: this.scene.viewPos.x - canvas.width / 2 / this.scene.zoom,
            minY: this.scene.viewPos.y - canvas.height / 2 / this.scene.zoom,
            maxX: this.scene.viewPos.x + canvas.width / 2 / this.scene.zoom,
            maxY: this.scene.viewPos.y + canvas.height / 2 / this.scene.zoom,
        });

        if (this.isMovingObject) {
            for (const nodeId of this.selectNodeIds) {
                const node = this.scene.getNode(nodeId);
                nodes.push(node);
            }
        }

        nodes.sort((a, b) => a.depth() - b.depth());

        for (const node of nodes) {
            node.render(this.ctx, this.scene.viewPos);
        }

        const dpr = window.devicePixelRatio;
        for (const nodeId of this.selectNodeIds) {
            const node = this.scene.getNode(nodeId);

            const x =
                this.ctx.canvas.width / 2 - this.scene.viewPos.x + node.pos.x;
            const y =
                this.ctx.canvas.height / 2 - this.scene.viewPos.y + node.pos.y;
            this.ctx.lineWidth = (5 * dpr) / this.scene.zoom;
            this.ctx.strokeStyle = "#38f";
            this.ctx.beginPath();
            this.ctx.roundRect(
                x - (10 * dpr) / this.scene.zoom,
                y - (10 * dpr) / this.scene.zoom,
                node.dim.width + (20 * dpr) / this.scene.zoom,
                node.dim.height + (20 * dpr) / this.scene.zoom,
                (10 * dpr) / this.scene.zoom,
            );
            this.ctx.stroke();
        }

        this.ctx.restore();
        window.requestAnimationFrame(this.render.bind(this));
    }

    resize() {
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
            const nodes = this.scene.rTree.search({
                minX: x,
                minY: y,
                maxX: x,
                maxY: y,
            });
            nodes.sort((a, b) => a.depth() - b.depth());
            if (nodes.length > 0) {
                const topNode = nodes[nodes.length - 1];
                if (e.shiftKey) {
                    const newSelectNodeIds = new Set(this.selectNodeIds);
                    if (this.selectNodeIds.has(topNode.id)) {
                        newSelectNodeIds.delete(topNode.id);
                    } else {
                        newSelectNodeIds.add(topNode.id);
                    }
                    this.setSelectNodeIds(newSelectNodeIds);
                } else {
                    if (!this.selectNodeIds.has(topNode.id)) {
                        // Update value instantly
                        this.selectNodeIds = new Set([topNode.id]);
                        this.setSelectNodeIds(this.selectNodeIds);
                    }

                    for (const nodeId of this.selectNodeIds) {
                        const node = this.scene.getNode(nodeId);
                        this.scene.rTree.remove(node);
                    }
                    this.isMovingObject = true;
                    this.ctx!.canvas.onpointermove = this.moveObject.bind(this);
                }
            } else {
                if (this.selectNodeIds.size > 0) {
                    this.setSelectNodeIds(new Set());
                }
            }
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
                this.scene.zoom - e.movementY * 0.01,
                0.1,
                3,
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
        for (const nodeId of this.selectNodeIds) {
            const node = this.scene.getNode(nodeId);
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
                    this.scene
                        .getRoot()
                        .addNode(
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
            for (const nodeId of this.selectNodeIds) {
                const node = this.scene.getNode(nodeId);
                this.scene.rTree.insert(node);
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
            this.scene.zoom = limit(this.scene.zoom - e.deltaY * 0.01, 0.1, 3);
        } else {
            this.scene.viewPos = new Pos(
                this.scene.viewPos.x + e.deltaX / this.scene.zoom,
                this.scene.viewPos.y + e.deltaY / this.scene.zoom,
            );
        }

        this.updateScene();
    }
}
