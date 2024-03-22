import { Button } from "@/components/ui/button";
import ThemeContainer from "@/components/ThemeContainer";
import CustomTitleBar from "@/components/CustomTitleBar";
import { EllipsisIcon, FileIcon, PlusIcon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDarkTheme } from "@/lib/theme";
import Background from "@/components/Background";
import { cn } from "@/lib/utils";

export default function WelcomeScreen() {
    const dark = useDarkTheme();

    const openSettings = () => {
        window.electronAPI.openSettings();
    };

    const quitApp = () => {
        window.electronAPI.quit();
    };

    const newScene = () => {
        window.electronAPI.newScene();
    };

    const openScene = () => {
        window.electronAPI.openScene();
    };

    return (
        <ThemeContainer dark={dark} className="flex h-full flex-col">
            <Background background="transparent" />
            <CustomTitleBar>
                <div className="no-drag-region ml-auto mr-1 flex items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <EllipsisIcon size={20} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className={cn({ dark })}
                            collisionPadding={10}
                        >
                            <DropdownMenuItem onClick={openSettings}>
                                Settings…
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={quitApp}>
                                Quit
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CustomTitleBar>
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
        </ThemeContainer>
    );
}
