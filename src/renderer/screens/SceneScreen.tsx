/** @jsxImportSource @emotion/react */

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
import { Scene } from "src/scene";
import { useDarkTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import {
    EllipsisIcon,
    EyeIcon,
    FileIcon,
    ImportIcon,
    ListTreeIcon,
    PlusIcon,
    SaveIcon,
    XIcon,
} from "lucide-react";
import { nanoid } from "nanoid";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { GluGroup, GluNode, GluObject } from "src/glunode";
import { css } from "@emotion/react";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Optional from "@/components/Optional";

export default function SceneScreen() {
    const dark = useDarkTheme();

    const [filePath, setFilePath] = useState("");
    const [scenes, setScenes] = useState<Record<string, Scene | null>>({});
    const [isLoading, setIsLoading] = useState(false);

    const fileInput = useRef<HTMLInputElement>(null);
    const [showInfo, setShowInfo] = useState(false);
    const [showLayers, setShowLayers] = useState(false);

    const [selectNodes, setSelectNodes] = useState<Set<GluNode>>(new Set());
    const setUpdateCounter = useState(0)[1];

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

    const updateScene = () => {
        setUpdateCounter((counter) => counter + 1);
    };

    const saveScene = useCallback(() => {
        if (scene) {
            const promise = (async () => {
                const data = await scene.serialize();
                await window.electronAPI.saveFile(filePath, data);
            })();
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
        <ThemeContainer dark={dark} className="flex h-full flex-col">
            <Background background="transparent" />
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
                    <CanvasView
                        scene={scene}
                        selectNodes={selectNodes}
                        setSelectNodes={setSelectNodes}
                        updateScene={updateScene}
                    />
                    {showInfo && scene ? (
                        <div className="absolute left-[10px] top-[40px] rounded-lg border bg-popover px-4 py-2">
                            <div>x: {scene.viewPos.x.toFixed(2)}</div>
                            <div>y: {scene.viewPos.y.toFixed(2)}</div>
                            <div>zoom: {scene.zoom.toFixed(2)}</div>
                        </div>
                    ) : null}
                    {showLayers ? (
                        <Layers
                            scene={scene}
                            selectNodes={selectNodes}
                            setSelectNodes={setSelectNodes}
                            setShowLayers={setShowLayers}
                        />
                    ) : null}
                </>
            ) : (
                <Welcome newScene={newScene} openScene={openScene} />
            )}
        </ThemeContainer>
    );
}

interface WelcomeProps {
    newScene: () => void;
    openScene: () => void;
}

function Welcome({ newScene, openScene }: WelcomeProps) {
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
        <Optional if={Object.keys(scenes).length > 1}>
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
                                        className="bg-background/30 px-6 ring-inset backdrop-blur-md"
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
                                            group-hover:opacity-100"
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

interface LayersProps {
    scene: Scene | null;
    selectNodes: Set<GluNode>;
    setSelectNodes: React.Dispatch<React.SetStateAction<Set<GluNode>>>;
    setShowLayers: React.Dispatch<React.SetStateAction<boolean>>;
}

function Layers({
    scene,
    selectNodes,
    setSelectNodes,
    setShowLayers,
}: LayersProps) {
    const rootNodes: [GluNode, boolean][] | undefined = scene
        ?.getRoot()
        .getNodes()
        .toReversed()
        .map((node) => [node, selectNodes.has(node)]);

    return (
        <div
            className="absolute right-[10px] top-[40px] flex max-h-[calc(100vh-50px)] w-[300px]
                flex-col overflow-hidden rounded-lg border bg-popover"
        >
            <div className="flex shrink-0 items-center font-medium">
                <Button
                    variant="ghost"
                    className="m-1 h-auto w-auto p-2"
                    onClick={() => setShowLayers(false)}
                >
                    <XIcon size={16} />
                </Button>
                Layers
            </div>
            {rootNodes ? (
                <div className="flex flex-col overflow-y-auto overflow-x-hidden p-1">
                    {rootNodes.map(([node, select], i) =>
                        node instanceof GluGroup ? null : (
                            <div
                                key={node.id}
                                className={cn(
                                    "flex shrink-0 items-center overflow-hidden rounded-md hover:bg-muted/50",
                                    {
                                        "!bg-accent !text-accent-foreground":
                                            select,
                                    },
                                )}
                                css={css`
                                    ${select && i > 0 && rootNodes[i - 1][1]
                                        ? `
                                            border-top-left-radius: 0;
                                            border-top-right-radius: 0;
                                        `
                                        : undefined}
                                    ${select &&
                                    i < rootNodes.length - 1 &&
                                    rootNodes[i + 1][1]
                                        ? `
                                            border-bottom-left-radius: 0;
                                            border-bottom-right-radius: 0;
                                        `
                                        : undefined}
                                `}
                            >
                                <Checkbox
                                    className="ml-3"
                                    checked={selectNodes.has(node)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setSelectNodes((set) => {
                                                const newSet = new Set(set);
                                                newSet.add(node);
                                                return newSet;
                                            });
                                        } else {
                                            setSelectNodes((set) => {
                                                const newSet = new Set(set);
                                                newSet.delete(node);
                                                return newSet;
                                            });
                                        }
                                    }}
                                />
                                <Button
                                    className="flex h-auto w-auto grow justify-start gap-2 overflow-hidden rounded-none
                                        border-none bg-transparent py-2 text-left hover:bg-transparent
                                        focus-visible:ring-inset active:bg-transparent"
                                    onClick={() => {
                                        setSelectNodes(new Set([node]));
                                        console.log(node);
                                    }}
                                >
                                    <span className="grow overflow-hidden text-ellipsis">
                                        {node.name}
                                    </span>
                                    <EyeIcon className="shrink-0" size={16} />
                                </Button>
                            </div>
                        ),
                    )}
                </div>
            ) : null}
        </div>
    );
}
