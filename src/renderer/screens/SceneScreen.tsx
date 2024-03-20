import Background from "@/components/Background";
import CanvasView from "@/components/CanvasView";
import CustomTitleBar from "@/components/CustomTitleBar";
import ThemeContainer from "@/components/ThemeContainer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dim } from "src/coordinate";
import { SceneState } from "src/scene";
import { useDarkTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import {
    EllipsisIcon,
    EyeIcon,
    ImportIcon,
    ListTreeIcon,
    SaveIcon,
    XIcon,
} from "lucide-react";
import { nanoid } from "nanoid";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { GluGroup, GluObject } from "src/glunode";

export default function SceneScreen() {
    const dark = useDarkTheme();

    const [filePath, setFilePath] = useState("");
    const [scenes, setScenes] = useState<Record<string, SceneState | null>>({});
    const [isLoading, setIsLoading] = useState(false);

    const fileInput = useRef<HTMLInputElement>(null);
    const [showInfo, setShowInfo] = useState(false);
    const [showLayers, setShowLayers] = useState(false);

    const [selectNodeIds, setSelectNodeIds] = useState<Set<string>>(new Set());
    const setUpdateCounter = useState(0)[1];

    useEffect(() => {
        if (filePath && scenes[filePath] === null && !isLoading) {
            setIsLoading(true);
            window.electronAPI.readFile(filePath).then((data) => {
                const scene = SceneState.deserialize(data);
                console.log(scene);
                setScenes((scenes) => ({
                    ...scenes,
                    [filePath]: scene,
                }));
                setIsLoading(false);
            });
        }
    }, [filePath, scenes, isLoading]);

    useEffect(() => {
        window.electronAPI.onOpenScene((filePath: string) => {
            setScenes((scenes) => ({
                ...scenes,
                [filePath]: null,
            }));
            setFilePath(filePath);
        });
    }, []);

    const scene: SceneState | null = scenes[filePath] ?? null;

    const newScene = () => {
        window.electronAPI.newScene();
    };

    const openScene = () => {
        window.electronAPI.openScene();
    };

    const openSettings = () => {
        window.electronAPI.openSettings();
    };

    const quitApp = () => {
        window.electronAPI.quit();
    };

    const importFile = () => {
        if (fileInput.current) {
            fileInput.current.click();
        }
    };

    const updateScene = () => {
        setUpdateCounter((counter) => counter + 1);
    };

    const saveScene = () => {
        if (scene) {
            scene
                .serialize()
                .then((data) => window.electronAPI.saveFile(filePath, data));
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0];
            if (file && scene) {
                scene
                    .getRoot()
                    .addNode(
                        new GluObject(
                            "image",
                            nanoid(),
                            file.name,
                            scene.viewPos.clone(),
                            new Dim(0, 0),
                            file,
                        ),
                    );
                setScenes({
                    ...scenes,
                    [filePath]: scene,
                });
            }
            e.target.value = "";
        }
    };

    return (
        <ThemeContainer dark={dark} className="flex flex-col h-full">
            <Background background="transparent" />
            <CustomTitleBar>
                {Object.keys(scenes).length > 1 ? (
                    <Tabs
                        value={filePath}
                        onValueChange={(value) => setFilePath(value)}
                        className="grow w-[400px]"
                    >
                        <TabsList className="no-drag-region">
                            {Object.keys(scenes).map((path) => {
                                const filename = path
                                    .replace(/^.*[\\/]/, "")
                                    .replace(/\.[^/.]+$/, "");
                                return (
                                    <TabsTrigger
                                        key={path}
                                        className="backdrop-blur-md bg-background/10"
                                        value={path}
                                    >
                                        {filename}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </Tabs>
                ) : null}
                <div className="flex items-center gap-1 ml-auto mr-1 no-drag-region">
                    <input
                        type="file"
                        ref={fileInput}
                        onChange={onFileChange}
                        hidden
                    />
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={saveScene}
                                >
                                    <SaveIcon size={20} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Save</p>
                            </TooltipContent>
                        </Tooltip>
                        {showLayers ? null : (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowLayers(true)}
                                    >
                                        <ListTreeIcon size={20} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Layers</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={importFile}
                                >
                                    <ImportIcon size={20} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Import file</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <EllipsisIcon size={20} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            collisionPadding={10}
                            className={cn("min-w-40", { dark })}
                        >
                            <DropdownMenuItem onClick={newScene}>
                                New Scene
                                <div className="ml-auto opacity-50">⌘N</div>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={openScene}>
                                Open Scene…
                                <div className="ml-auto opacity-50">⌘O</div>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                Close Scene
                                <div className="ml-auto opacity-50">⌘W</div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() =>
                                    setShowInfo((showInfo) => !showInfo)
                                }
                            >
                                Debug Info
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={openSettings}>
                                Settings…
                                <div className="ml-auto opacity-50">⌘,</div>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={quitApp}>
                                Quit
                                <div className="ml-auto opacity-50">⌘Q</div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CustomTitleBar>
            <CanvasView
                scene={scene}
                selectNodeIds={selectNodeIds}
                updateScene={updateScene}
                setSelectNodeIds={setSelectNodeIds}
            />
            {showInfo && scene ? (
                <div className="absolute top-[40px] left-[10px] bg-background/80 px-3 py-1 rounded-md backdrop-blur-md">
                    <div>x: {scene.viewPos.x.toFixed(2)}</div>
                    <div>y: {scene.viewPos.y.toFixed(2)}</div>
                    <div>zoom: {scene.zoom.toFixed(2)}</div>
                </div>
            ) : null}
            {showLayers && scene ? (
                <div className="absolute right-[10px] top-[40px] w-[300px] max-h-[calc(100vh-50px)] overflow-hidden flex flex-col border rounded-md bg-background">
                    <div className="pl-3 flex items-center font-medium gap-2 shrink-0">
                        <ListTreeIcon size={16} absoluteStrokeWidth />
                        Layers
                        <Button
                            variant="ghost"
                            className="m-1 ml-auto w-auto h-auto p-2"
                            onClick={() => setShowLayers(false)}
                        >
                            <XIcon size={16} />
                        </Button>
                    </div>
                    <div className="flex flex-col overflow-x-hidden overflow-y-auto">
                        {scene
                            .getRoot()
                            .getNodes()
                            .toReversed()
                            .map((child) =>
                                child instanceof GluGroup ? null : (
                                    <div
                                        key={child.id}
                                        className={cn(
                                            "flex shrink-0 items-center border-t overflow-hidden bg-background/50 hover:bg-muted/50",
                                            {
                                                "bg-muted": selectNodeIds.has(
                                                    child.id,
                                                ),
                                            },
                                        )}
                                    >
                                        <Checkbox
                                            className="ml-3"
                                            checked={selectNodeIds.has(
                                                child.id,
                                            )}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectNodeIds((set) => {
                                                        const newSet = new Set(
                                                            set,
                                                        );
                                                        newSet.add(child.id);
                                                        return newSet;
                                                    });
                                                } else {
                                                    setSelectNodeIds((set) => {
                                                        const newSet = new Set(
                                                            set,
                                                        );
                                                        newSet.delete(child.id);
                                                        return newSet;
                                                    });
                                                }
                                            }}
                                        />
                                        <Button
                                            className="flex grow gap-2 justify-start overflow-hidden rounded-none border-none bg-transparent hover:bg-transparent active:bg-transparent py-2 text-left h-auto w-auto focus-visible:ring-inset"
                                            onClick={() => {
                                                setSelectNodeIds(
                                                    new Set([child.id]),
                                                );
                                                console.log(child);
                                            }}
                                        >
                                            <span className="grow overflow-hidden text-ellipsis">
                                                {child.name}
                                            </span>
                                            <EyeIcon
                                                className="shrink-0"
                                                size={20}
                                            />
                                        </Button>
                                    </div>
                                ),
                            )}
                    </div>
                </div>
            ) : null}
        </ThemeContainer>
    );
}
