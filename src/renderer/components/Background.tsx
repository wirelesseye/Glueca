import { Global, css } from "@emotion/react";

interface BackgroundProps {
    background: string;
}

export default function Background({ background }: BackgroundProps) {
    return (
        <Global
            styles={css`
                body {
                    background: ${background};
                }
            `}
        />
    );
}
