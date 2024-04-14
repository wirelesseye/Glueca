import { ReactNode, forwardRef, useState } from "react";
import { Input, InputProps } from "./input";

const keyboardLayoutMap: { current: KeyboardLayoutMap | null } = {
    current: null,
};
navigator.keyboard.getLayoutMap().then((map) => {
    keyboardLayoutMap.current = map;
});

export interface HotkeyInputProps extends InputProps {}

const HotkeyInput = forwardRef<HTMLInputElement, HotkeyInputProps>(
    ({ ...props }, ref) => {
        const [hotkey, setHotkey] = useState({
            key: "",
            meta: false,
            shift: false,
            ctrl: false,
            alt: false,
        });

        const onKeyDown = (e: React.KeyboardEvent) => {
            console.log(e);
            setHotkey({
                key: keyboardLayoutMap.current?.get(e.code) ?? "",
                meta: e.metaKey,
                shift: e.shiftKey,
                ctrl: e.ctrlKey,
                alt: e.altKey,
            });
        };

        return (
            <div className="relative">
                <Input ref={ref} readOnly onKeyDown={onKeyDown} {...props} />
                <div className="pointer-events-none absolute top-0 flex h-full items-center gap-1 px-3">
                    {hotkey.ctrl && hotkey.key !== "Control" ? (
                        <Key>{getKeyIcon("Control")}</Key>
                    ) : null}
                    {hotkey.alt && hotkey.key !== "Alt" ? (
                        <Key>{getKeyIcon("Alt")}</Key>
                    ) : null}
                    {hotkey.shift && hotkey.key !== "Shift" ? (
                        <Key>{getKeyIcon("Shift")}</Key>
                    ) : null}
                    {hotkey.meta && hotkey.key !== "Meta" ? (
                        <Key>{getKeyIcon("Meta")}</Key>
                    ) : null}
                    {hotkey.key ? <Key>{getKeyIcon(hotkey.key)}</Key> : null}
                </div>
            </div>
        );
    },
);
HotkeyInput.displayName = "Input";

interface KeyProps {
    children: ReactNode;
}

function Key({ children }: KeyProps) {
    return (
        <div
            className="rounded-md border bg-muted px-1.5 text-sm font-medium text-muted-foreground
                shadow-sm"
        >
            {children}
        </div>
    );
}

function getKeyIcon(key: string) {
    if (key === "Meta") {
        return "⌘";
    }
    if (key === "Shift") {
        return "⇧";
    }
    if (key === "Control") {
        return "⌃";
    }
    if (key === "Alt") {
        return "⌥";
    }
    if (key === " ") {
        return "␣";
    }

    return key.toUpperCase();
}

export { HotkeyInput };
