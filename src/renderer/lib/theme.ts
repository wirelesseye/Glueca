import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../../tailwind.config";
import { useCallback, useEffect, useState } from "react";
import chroma from "chroma-js";

const fullConfig = resolveConfig(tailwindConfig);

export const theme = fullConfig.theme;
export const colors = theme.colors;

export const useDarkTheme = () => {
    const [isDark, setIsDark] = useState(
        window.matchMedia("(prefers-color-scheme: dark)").matches,
    );

    const updateListener = useCallback((e: MediaQueryListEvent) => {
        setIsDark(e.matches);
    }, []);

    useEffect(() => {
        window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", updateListener);
        return () =>
            window
                .matchMedia("(prefers-color-scheme: dark)")
                .removeEventListener("change", updateListener);
    });

    return isDark;
};

export let accentColor = "#007AFF";
export let accentDarkenColor = "#006ee6";

window.electronAPI.getAccentColor().then((hex) => {
    const root = document.querySelector(":root") as HTMLElement;

    const color = chroma(hex);
    const darkenColor = color.darken(0.2);

    accentColor = hex;
    accentDarkenColor = darkenColor.hex();

    const hsl = color.hsl();
    const darkenHsl = darkenColor.hsl();
    const ringHsl = color.desaturate(2).hsl();

    root.style.setProperty("--accent", `${hsl[0]} ${hsl[1] * 100}% ${hsl[2] * 100}%`);
    root.style.setProperty("--ring", `${ringHsl[0]} ${ringHsl[1] * 100}% ${ringHsl[2] * 100}%`);
    root.style.setProperty("--accent-darken", `${darkenHsl[0]} ${darkenHsl[1] * 100}% ${darkenHsl[2] * 100}%`);
    root.style.setProperty("--accent-foreground", "0 0% 100%");
});
