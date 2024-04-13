import CanvasController from "@/lib/CanvasController";
import { Scene } from "src/scene";
import { useCallback, useEffect, useMemo } from "react";

interface CanvasViewProps {
    scene: Scene | null;
    updateScene: () => void;
}

export default function CanvasView({
    scene,
    updateScene,
}: CanvasViewProps) {
    const controller = useMemo(() => new CanvasController(), []);

    const onCanvasRefUpdate = useCallback((ref: HTMLCanvasElement) => {
        if (ref) {
            const ctx = ref.getContext("2d");
            if (ctx) {
                controller.initialize(ctx);
                controller.onSceneUpdate(updateScene);
            }
        }
    }, []);

    useEffect(() => {
        controller.setScene(scene);
    }, [scene]);

    return (
        <canvas
            className="absolute left-0 top-0 h-screen w-screen"
            ref={onCanvasRefUpdate}
        ></canvas>
    );
}
