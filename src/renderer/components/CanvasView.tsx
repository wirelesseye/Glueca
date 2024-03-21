import CanvasController from "@/lib/CanvasController";
import { Scene } from "src/scene";
import { useCallback, useEffect, useRef } from "react";
import { GluNode } from "src/glunode";

interface CanvasViewProps {
    scene: Scene | null;
    selectNodes: Set<GluNode>;
    setSelectNodes: (selectNodes: Set<GluNode>) => void;
    updateScene: () => void;
}

export default function CanvasView({
    scene,
    selectNodes,
    setSelectNodes,
    updateScene,
}: CanvasViewProps) {
    const controller = useRef(new CanvasController());

    const onCanvasRefUpdate = useCallback((ref: HTMLCanvasElement) => {
        if (ref) {
            const ctx = ref.getContext("2d");
            if (ctx) {
                controller.current.setCtx(ctx);
                controller.current.onSceneUpdate(updateScene);
                controller.current.onSelectNodesUpdate(setSelectNodes);
            }
        }
    }, []);

    useEffect(() => {
        controller.current.setScene(scene);
    }, [scene]);

    useEffect(() => {
        controller.current.updateSelectNodes(selectNodes);
    }, [selectNodes]);

    return (
        <canvas
            className="absolute left-0 top-0 h-screen w-screen"
            ref={onCanvasRefUpdate}
        ></canvas>
    );
}
