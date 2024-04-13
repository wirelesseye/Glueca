import { nanoid } from "nanoid";
import { Pos, Dim } from "./coordinate";
import DataBuffer from "./databuffer";
import RBush, { BBox } from "rbush";
import { GluGroup, GluNode, GluObject } from "./glunode";

export class Scene {
    viewPos: Pos;
    zoom: number;
    root: GluGroup;
    private rTree: RBush<GluObject>;
    private nodeById: Record<string, GluNode>;
    private selectNodes: Set<GluNode>;

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
        this.selectNodes = new Set();
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
     
    registerNode(node: GluNode) {
        node.setScene(this);
        this.nodeById[node.id] = node;
        if (node instanceof GluObject) {
            this.rTree.insert(node);
        } else {
            for (const child of (node as GluGroup).getChildren()) {
                this.registerNode(child);
            }
        }
    }

    unregisterNode(node: GluNode) {
        delete this.nodeById[node.id];
        if (node instanceof GluObject) {
            this.rTree.remove(node);
        } else {
            for (const child of (node as GluGroup).getChildren()) {
                this.unregisterNode(child);
            }
        }
    }

    getNodeById(nodeId: string) {
        return this.nodeById[nodeId];
    }

    getNodesInRect(rect: BBox) {
        return this.rTree.search(rect);
    }

    isNodeSelected(node: GluNode) {
        return this.selectNodes.has(node);
    }

    selectNode(node: GluNode) {
        this.selectNodes.add(node);
    }

    unselectNode(node: GluNode) {
        this.selectNodes.delete(node);
    }

    unselectAllNodes() {
        this.selectNodes.clear();
    }

    getSelectedNodes(): Iterable<GluNode> {
        return this.selectNodes;
    }

    hasSelectNode() {
        return this.selectNodes.size > 0;
    }
}
