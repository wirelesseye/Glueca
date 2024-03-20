/** @jsxImportSource @emotion/react */

import { colors } from "@/lib/theme";
import { Global, css } from "@emotion/react";

interface GlobalThemeProps {
    dark: boolean;
    noBg?: boolean;
}

export default function GlobalTheme({ dark, noBg }: GlobalThemeProps) {
    return (
        <Global
            styles={css`
                body {
                    background-color: ${noBg
                        ? "transparent"
                        : dark
                          ? "rgba(0, 0, 0, 0.5)"
                          : "rgba(255, 255, 255, 0.5)"};
                    color: ${dark ? colors.background : colors.foreground};
                }
            `}
        />
    );
}
