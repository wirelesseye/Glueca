import { cn } from "@/lib/utils";
import { HTMLProps, forwardRef } from "react";

interface ThemeContainerProps extends HTMLProps<HTMLDivElement> {
    dark: boolean;
}

const ThemeContainer = forwardRef<HTMLDivElement, ThemeContainerProps>(
    (props, ref) => {
        const { className, dark, ...other } = props;

        return <div ref={ref} className={cn({ dark }, className)} {...other} />;
    },
);

export default ThemeContainer;
