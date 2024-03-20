import CanvasController from "@/lib/CanvasController";
import { SceneState } from "src/scene";
import { useCallback, useEffect, useRef } from "react";

interface CanvasViewProps {
    scene: SceneState | null;
    selectNodeIds: Set<string>;
    setSelectNodeIds: (selectNodeIds: Set<string>) => void;
    updateScene: () => void;
}

export default function CanvasView({
    scene,
    selectNodeIds,
    setSelectNodeIds,
    updateScene,
}: CanvasViewProps) {
    const controller = useRef(new CanvasController());

    const onCanvasRefUpdate = useCallback((ref: HTMLCanvasElement) => {
        if (ref) {
            const ctx = ref.getContext("2d");
            if (ctx) {
                controller.current.setCtx(ctx);
                controller.current.onSceneUpdate(updateScene);
                controller.current.onSelectNodeIdsUpdate(setSelectNodeIds);
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
