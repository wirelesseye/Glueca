/** @jsxImportSource @emotion/react */

import { GluGroup, GluNode } from "src/glunode";
import { Scene } from "src/scene";
import { Button } from "./ui/button";
import { EyeIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { css } from "@emotion/react";
import { Checkbox } from "./ui/checkbox";
import { useForceUpdate } from "@/lib/hooks";

interface LayersProps {
    scene: Scene;
    setShowLayers: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Layers({ scene, setShowLayers }: LayersProps) {
    const updateScene = useForceUpdate();
    
    const rootNodes: [GluNode, boolean][] | undefined = scene.root
        .getChildren()
        .toReversed()
        .map((node) => [node, scene.isNodeSelected(node)]);

    return (
        <div
            className="absolute right-[10px] top-[40px] flex max-h-[calc(100vh-50px)] w-[300px]
                flex-col overflow-hidden rounded-lg border bg-popover"
        >
            <div className="flex h-8 shrink-0 items-center justify-center border-b border-border bg-muted/50">
                <Button
                    variant="ghost"
                    className="absolute left-1 h-auto w-auto p-1"
                    onClick={() => setShowLayers(false)}
                >
                    <XIcon size={16} />
                </Button>
                <span className="text-sm font-medium">Layers</span>
            </div>
            {rootNodes ? (
                <div className="flex flex-col overflow-y-auto overflow-x-hidden p-1">
                    {rootNodes.map(([node, select], i) =>
                        node instanceof GluGroup ? null : (
                            <div
                                key={node.id}
                                className={cn(
                                    "flex shrink-0 items-center overflow-hidden rounded-md hover:bg-muted/80",
                                    {
                                        "!bg-accent-darken !text-accent-foreground":
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
                                    className="ml-2.5"
                                    checked={scene.isNodeSelected(node)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            scene.selectNode(node);
                                        } else {
                                            scene.unselectNode(node);
                                        }
                                        updateScene();
                                    }}
                                />
                                <Button
                                    className="flex h-auto w-auto grow justify-start gap-2 overflow-hidden rounded-none
                                        border-none bg-transparent px-3 py-1.5 text-left hover:bg-transparent
                                        focus-visible:ring-inset active:bg-transparent"
                                    onClick={() => {
                                        scene.unselectAllNodes();
                                        scene.selectNode(node);
                                        updateScene();
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
