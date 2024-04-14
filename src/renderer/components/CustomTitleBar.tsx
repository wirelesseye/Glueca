/** @jsxImportSource @emotion/react */

import { cn } from "@/lib/utils";
import { css } from "@emotion/react";
import { ReactNode } from "react";

interface CustomTitleBarProps {
    children?: ReactNode;
    background?: boolean;
    className?: string;
    height?: number;
}

export default function CustomTitleBar({
    children,
    background,
    className,
    height
}: CustomTitleBarProps) {
    return (
        <div
            className={cn(
                "drag-region fixed left-0 right-0 top-0 z-50 flex pl-[100px]",
                { "bg-background/50 backdrop-blur-sm": background },
                className,
            )}
            css={css`
                height: ${height ? height : 40}px;
            `}
        >
            {children}
        </div>
    );
}
