import { FileIcon, PlusIcon } from "lucide-react";
import { Button } from "./ui/button";

interface WelcomeProps {
    newScene: () => void;
    openScene: () => void;
}

export default function Welcome({ newScene, openScene }: WelcomeProps) {
    return (
        <div className="mt-[38px] flex grow flex-col items-center justify-center gap-8">
            <div className="text-3xl font-bold">Welcome</div>
            <div className="flex gap-5">
                <Button
                    variant="ghost-accent"
                    className="flex h-24 flex-col gap-2 bg-background/30"
                    onClick={newScene}
                >
                    <div className="flex h-10 w-10 items-center justify-center">
                        <PlusIcon absoluteStrokeWidth size={35} />
                    </div>
                    <div>New Scene</div>
                </Button>
                <Button
                    variant="ghost-accent"
                    className="flex h-24 flex-col gap-2 bg-background/30"
                    onClick={openScene}
                >
                    <div className="flex h-10 w-10 items-center justify-center">
                        <FileIcon absoluteStrokeWidth size={30} />
                    </div>
                    Open Scene
                </Button>
            </div>
        </div>
    );
}
