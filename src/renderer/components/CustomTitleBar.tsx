import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CustomTitleBarProps {
    children?: ReactNode;
    background?: boolean;
    className?: string;
}

export default function CustomTitleBar({
    children,
    background,
    className,
}: CustomTitleBarProps) {
    return (
        <div
            className={cn(
                "drag-region fixed left-0 right-0 top-0 z-50 flex h-[40px] pl-[100px]",
                { "bg-background/50 backdrop-blur-sm": background },
                className,
            )}
        >
            {children}
        </div>
    );
}
