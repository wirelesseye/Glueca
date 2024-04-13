import { Dim, Pos } from "./coordinate";
import DataBuffer from "./databuffer";
import { Scene } from "./scene";

export abstract class GluNode {
    private scene: Scene | null = null;
    private parent: GluGroup | null = null;

    constructor(
        public type: string,
        public id: string,
        public name: string,
        public pos: Pos,
        public dim: Dim,
    ) {}

    getScene() {
        return this.scene;
    }

    setScene(scene: Scene | null) {
        this.scene = scene;
    }

    setParent(parent: GluGroup | null) {
        this.parent = parent;
    }

    getParent() {
        return this.parent;
    }

    get minX() {
        return this.pos.x;
    }

    get minY() {
        return this.pos.y;
    }

    get maxX() {
        return this.pos.x + this.dim.width;
    }

    get maxY() {
        return this.pos.y + this.dim.height;
    }

    depth(): number {
        const ancestor = this.getParent();
        if (!ancestor) {
            return 0;
        }

        return ancestor.getChildren().indexOf(this);
    }

    abstract render(ctx: CanvasRenderingContext2D, viewPos: Pos): void;

    abstract writeToDataBuffer(dataBuffer: DataBuffer): Promise<void>;

    static readFromDataBuffer(dataBuffer: DataBuffer) {
        const type = dataBuffer.getString(true);
        if (type === "group") {
            return GluGroup.readFromDataBuffer(dataBuffer);
        } else {
            return GluObject.readFromDataBuffer(dataBuffer);
        }
    }
}

export class GluObject extends GluNode {
    private image: HTMLImageElement | null;

    constructor(
        // eslint-disable-next-line @typescript-eslint/ban-types
        type: "image" | (string & {}),
        id: string,
        name: string,
        pos: Pos,
        dim: Dim,
        public blob: Blob,
    ) {
        super(type, id, name, pos, dim);
        this.image = null;
    }

    render(ctx: CanvasRenderingContext2D, viewPos: Pos) {
        const dx = ctx.canvas.width / 2 - viewPos.x + this.pos.x;
        const dy = ctx.canvas.height / 2 - viewPos.y + this.pos.y;

        if (this.image) {
            ctx.drawImage(this.image, dx, dy);
        } else {
            const image = new Image();
            image.onload = () => {
                this.dim.width = image.width;
                this.dim.height = image.height;
                this.getScene()?.unregisterNode(this);
                this.getScene()?.registerNode(this);
            };
            image.src = URL.createObjectURL(this.blob);
            this.image = image;
        }
    }

    async writeToDataBuffer(dataBuffer: DataBuffer) {
        dataBuffer.putString(this.type);
        dataBuffer.putString(this.id);
        dataBuffer.putString(this.name);
        await this.pos.writeToDataBuffer(dataBuffer);
        await this.dim.writeToDataBuffer(dataBuffer);
        await dataBuffer.putBlob(this.blob);
    }

    static readFromDataBuffer(dataBuffer: DataBuffer) {
        const type = dataBuffer.getString();
        const id = dataBuffer.getString();
        const name = dataBuffer.getString();
        const pos = Pos.readFromDataBuffer(dataBuffer);
        const dim = Dim.readFromDataBuffer(dataBuffer);
        const blob = dataBuffer.getBlob();
        return new GluObject(type, id, name, pos, dim, blob);
    }
}

export class GluGroup extends GluNode {
    constructor(
        id: string,
        name: string,
        pos: Pos,
        dim: Dim,
        private children: GluNode[],
    ) {
        super("group", id, name, pos, dim);
    }

    render(ctx: CanvasRenderingContext2D, viewPos: Pos): void {
        for (const child of this.children) {
            child.render(ctx, viewPos);
        }
    }

    getChildren() {
        return [...this.children];
    }

    addChild(node: GluNode) {
        this.children.push(node);
        node.setParent(this);
        this.getScene()!.registerNode(node);
    }

    removeChild(node: GluNode) {
        const index = this.children.indexOf(node);
        this.children.splice(index, 1);
        this.getScene()!.unregisterNode(node);
    }

    async writeToDataBuffer(dataBuffer: DataBuffer): Promise<void> {
        dataBuffer.putString(this.type);
        dataBuffer.putString(this.id);
        dataBuffer.putString(this.name);
        await this.pos.writeToDataBuffer(dataBuffer);
        await this.dim.writeToDataBuffer(dataBuffer);
        dataBuffer.putI32(this.children.length);
        for (const child of this.children) {
            await child.writeToDataBuffer(dataBuffer);
        }
    }

    static readFromDataBuffer(dataBuffer: DataBuffer) {
        dataBuffer.getString();
        const id = dataBuffer.getString();
        const name = dataBuffer.getString();
        const pos = Pos.readFromDataBuffer(dataBuffer);
        const dim = Dim.readFromDataBuffer(dataBuffer);
        const length = dataBuffer.getI32();
        const childen: GluNode[] = [];
        const group = new GluGroup(id, name, pos, dim, childen);
        for (let i = 0; i < length; i++) {
            const node = GluNode.readFromDataBuffer(dataBuffer);
            node.setParent(group);
            childen.push(node);
        }
        return group;
    }
}
