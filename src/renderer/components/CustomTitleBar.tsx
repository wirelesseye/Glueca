import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CustomTitleBarProps {
    children?: ReactNode;
    background?: boolean;
}

export default function CustomTitleBar({
    children,
    background,
}: CustomTitleBarProps) {
    return (
        <div
            className={cn(
                "flex pl-[100px] fixed z-50 top-0 left-0 right-0 h-[38px] drag-region",
                { "bg-background/50 backdrop-blur-sm": background },
            )}
        >
            {children}
        </div>
    );
}
