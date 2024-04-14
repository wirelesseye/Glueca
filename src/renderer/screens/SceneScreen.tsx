import CanvasView from "@/components/CanvasView";
import CustomTitleBar from "@/components/CustomTitleBar";
import { Button } from "@/components/ui/button";
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
import { Scene } from "src/scene";
import {
    EllipsisIcon,
    ImportIcon,
    ListTreeIcon,
    SaveIcon,
    XIcon,
} from "lucide-react";
import { nanoid } from "nanoid";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { GluObject } from "src/glunode";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Optional from "@/components/Optional";
import Welcome from "@/components/Welcome";
import Layers from "@/components/Layers";
import { useForceUpdate } from "@/lib/hooks";

export default function SceneScreen() {
    const [filePath, setFilePath] = useState("");
    const [scenes, setScenes] = useState<Record<string, Scene | null>>({});
    const [isLoading, setIsLoading] = useState(false);

    const fileInput = useRef<HTMLInputElement>(null);
    const [showInfo, setShowInfo] = useState(false);
    const [showLayers, setShowLayers] = useState(false);

    const canClose = useRef(false);

    const updateScene = useForceUpdate();

    useEffect(() => {
        if (filePath && scenes[filePath] === null && !isLoading) {
            setIsLoading(true);
            window.electronAPI.readFile(filePath).then((data) => {
                const scene = Scene.deserialize(data);
                console.log(scene);
                setScenes((scenes) => ({
                    ...scenes,
                    [filePath]: scene,
                }));
                setIsLoading(false);
            });
        }
    }, [filePath, scenes, isLoading]);

    const scene: Scene | null = scenes[filePath] ?? null;

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

    const saveScene = useCallback(() => {
        if (scene) {
            const promise = scene
                .serialize()
                .then((data) => window.electronAPI.saveFile(filePath, data));
            toast.promise(promise, {
                loading: "Saving…",
                success: "Saved",
            });
        }
    }, [scene]);

    const closeScene = useCallback(
        (path?: string) => {
            if (!path) path = filePath;

            const newScenes = { ...scenes };
            delete newScenes[path];
            setScenes(newScenes);

            if (filePath === path) {
                if (Object.keys(newScenes).length > 0) {
                    setFilePath(Object.keys(newScenes)[0]);
                }
            }
        },
        [filePath, scenes],
    );

    useEffect(() => {
        window.electronAPI.onOpenScene((filePath: string) => {
            setScenes((scenes) => ({
                ...scenes,
                [filePath]: null,
            }));
            setFilePath(filePath);
        });
    }, []);

    useEffect(() => {
        window.electronAPI.onSaveScene(saveScene);
        return () => {
            window.electronAPI.removeAllListeners("save-scene");
        };
    }, [saveScene]);

    useEffect(() => {
        window.electronAPI.onCloseScene(closeScene);
        return () => {
            window.electronAPI.removeAllListeners("close-scene");
        };
    }, [closeScene]);

    useEffect(() => {
        window.electronAPI.onSaveWindowState(() => {
            window.electronAPI.saveFilePaths(Object.keys(scenes));
        });
        return () => {
            window.electronAPI.removeAllListeners("save-window-state");
        };
    }, [scenes]);

    useEffect(() => {
        window.onbeforeunload = (event) => {
            if (!canClose.current) {
                event.returnValue = false;
                Promise.all(
                    Object.keys(scenes).map((filePath) => {
                        const scene = scenes[filePath];
                        return scene
                            ? scene
                                  .serialize()
                                  .then((data) =>
                                      window.electronAPI.saveFile(
                                          filePath,
                                          data,
                                      ),
                                  )
                            : Promise.resolve();
                    }),
                ).then(() => {
                    canClose.current = true;
                    window.close();
                });
                toast.loading("Saving...");
            }
        };
    }, [scenes]);

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0];
            if (file && scene) {
                scene.root.addChild(
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
        <div className="flex h-full flex-col">
            <CustomTitleBar className="gap-3">
                <SceneTabs
                    scenes={scenes}
                    closeScene={closeScene}
                    filePath={filePath}
                    setFilePath={setFilePath}
                />
                <div className="no-drag-region ml-auto mr-2 flex items-center gap-1">
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
                                    <SaveIcon size={20} strokeWidth={1.8} />
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
                                        <ListTreeIcon
                                            size={20}
                                            strokeWidth={1.8}
                                        />
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
                                    <ImportIcon size={20} strokeWidth={1.8} />
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
                                <EllipsisIcon size={20} strokeWidth={1.8} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            collisionPadding={10}
                            className="min-w-40"
                        >
                            <DropdownMenuItem onClick={newScene}>
                                New Scene
                                <div className="ml-auto opacity-50">⌘N</div>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={openScene}>
                                Open Scene…
                                <div className="ml-auto opacity-50">⌘O</div>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => closeScene()}>
                                Close Scene
                                <div className="ml-auto opacity-50">⌘W</div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="gap-2"
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
            {scene ? (
                <>
                    <CanvasView scene={scene} updateScene={updateScene} />
                    <Optional show={showInfo}>
                        <div className="absolute left-[10px] top-[40px] rounded-lg border bg-popover px-4 py-2">
                            <div>x: {scene.viewPos.x.toFixed(2)}</div>
                            <div>y: {scene.viewPos.y.toFixed(2)}</div>
                            <div>zoom: {scene.zoom.toFixed(2)}</div>
                        </div>
                    </Optional>
                    <Optional show={showLayers}>
                        <Layers scene={scene} setShowLayers={setShowLayers} />
                    </Optional>
                </>
            ) : (
                <Welcome newScene={newScene} openScene={openScene} />
            )}
        </div>
    );
}

interface SceneTabsProps {
    scenes: Record<string, Scene | null>;
    filePath: string;
    setFilePath: React.Dispatch<React.SetStateAction<string>>;
    closeScene: (path: string) => void;
}

function SceneTabs({
    scenes,
    filePath,
    setFilePath,
    closeScene,
}: SceneTabsProps) {
    return (
        <Optional show={Object.keys(scenes).length > 1}>
            <ScrollArea className="no-drag-region flex items-center">
                <Tabs
                    value={filePath}
                    onValueChange={(value) => setFilePath(value)}
                >
                    <TabsList>
                        {Object.keys(scenes).map((path) => {
                            const filename = path
                                .replace(/^.*[\\/]/, "")
                                .replace(/\.[^/.]+$/, "");
                            return (
                                <div key={path} className="group relative">
                                    <TabsTrigger
                                        className="bg-background/10 px-6 ring-inset backdrop-blur-md backdrop-contrast-50"
                                        value={path}
                                        onMouseUp={(e) => {
                                            if (e.button === 1)
                                                closeScene(path);
                                        }}
                                    >
                                        {filename}
                                    </TabsTrigger>
                                    <Button
                                        className="absolute left-0 top-1 z-10 h-6 w-6 p-0 opacity-0 transition-opacity
                                            active:bg-transparent active:text-muted-foreground/30 group-hover:opacity-100"
                                        variant="ghost"
                                        tabIndex={-1}
                                        onClick={() => closeScene(path)}
                                    >
                                        <XIcon
                                            size={12}
                                            absoluteStrokeWidth
                                            strokeWidth={1.5}
                                        />
                                    </Button>
                                </div>
                            );
                        })}
                    </TabsList>
                </Tabs>
                <ScrollBar orientation="horizontal" className="opacity-50" />
            </ScrollArea>
        </Optional>
    );
}
