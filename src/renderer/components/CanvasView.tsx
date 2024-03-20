import CanvasController from "@/lib/CanvasController";
import { SceneState } from "src/scene";
import { useCallback, useEffect, useRef } from "react";

interface CanvasViewProps {
    scene: SceneState | null;
    selectNodeIds: Set<string>;
    onSelectNodeIdsUpdate: (selectNodeIds: Set<string>) => void;
    onSceneUpdate: () => void;
}

export default function CanvasView({ scene, selectNodeIds, onSelectNodeIdsUpdate, onSceneUpdate }: CanvasViewProps) {
    const controller = useRef(new CanvasController(onSceneUpdate, onSelectNodeIdsUpdate));

    const onCanvasRefUpdate = useCallback((ref: HTMLCanvasElement) => {
        if (ref) {
            const ctx = ref.getContext("2d");
            if (ctx) {
                controller.current.setCtx(ctx);
            }
        }
    }, []);

    useEffect(() => {
        controller.current.setScene(scene);
    }, [scene]);

    useEffect(() => {
        controller.current.updateSelectNodeIds(selectNodeIds);
    }, [selectNodeIds]);

    return (
        <canvas
            className="absolute left-0 top-0 h-screen w-screen"
            ref={onCanvasRefUpdate}
        ></canvas>
    );
}
