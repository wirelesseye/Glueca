import { nanoid } from "nanoid";
import { Pos, Dim } from "./coordinate";
import DataBuffer from "./databuffer";
import RBush from "rbush";
import { GluGroup, GluNode, GluObject } from "./glunode";

export class Scene {
    viewPos: Pos;
    zoom: number;
    private root: GluGroup;
    private nodeById: Record<string, GluNode>;
    rTree: RBush<GluObject>;

    private constructor(
        viewPos: Pos,
        zoom: number,
        root: GluGroup,
        nodeById: Record<string, GluNode>,
        rTree: RBush<GluObject>,
    ) {
        this.root = root;
        this.viewPos = viewPos;
        this.zoom = zoom;
        this.nodeById = nodeById;
        this.rTree = rTree;
    }

    static create() {
        const root = new GluGroup(
            nanoid(),
            "root",
            new Pos(0, 0),
            new Dim(0, 0),
            [],
        );
        root.setParent(null);
        const viewPos = new Pos(0, 0);
        const zoom = 1;
        const nodeById = {};
        const rTree = new RBush<GluObject>();
        const scene = new Scene(viewPos, zoom, root, nodeById, rTree);
        scene.registerNode(root);
        return scene;
    }

    async serialize() {
        const dataBuffer = DataBuffer.create();
        dataBuffer.putString("GLUECA", true);
        dataBuffer.putI32(1); // file version
        await this.viewPos.writeToDataBuffer(dataBuffer);
        dataBuffer.putF32(this.zoom);
        await this.root.writeToDataBuffer(dataBuffer);
        return dataBuffer.toUint8Array();
    }

    static deserialize(uint8Array: Uint8Array): Scene {
        const dataBuffer = DataBuffer.fromUint8Array(uint8Array);
        const validate = dataBuffer.getString(false, 6);
        if (validate !== "GLUECA") {
            console.error("Invalid scene file");
        }
        dataBuffer.getI32(); // file version
        const viewPos = Pos.readFromDataBuffer(dataBuffer);
        const zoom = dataBuffer.getF32();
        const root = GluGroup.readFromDataBuffer(dataBuffer);
        root.setParent(null);
        const scene = new Scene(
            viewPos,
            zoom,
            root,
            {},
            new RBush<GluObject>(),
        );
        scene.registerNode(root);
        return scene;
    }

    getRoot() {
        return this.root;
    }

    registerNode(node: GluNode) {
        node.setScene(this);
        this.nodeById[node.id] = node;
        if (node instanceof GluObject) {
            this.rTree.insert(node);
        } else {
            for (const child of (node as GluGroup).getNodes()) {
                this.registerNode(child);
            }
        }
    }

    getNode(nodeId: string) {
        return this.nodeById[nodeId];
    }
}
