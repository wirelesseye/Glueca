import resolveConfig from "tailwindcss/resolveConfig";
// eslint-disable-next-line
import tailwindConfig from "../../../tailwind.config";
import { useCallback, useEffect, useState } from "react";

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
