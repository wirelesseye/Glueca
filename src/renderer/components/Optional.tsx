import { ReactNode } from "react";

interface OptionalProps {
    if: boolean;
    children?: ReactNode;
}

export default function Optional(props: OptionalProps) {
    if (props.if) {
        return <>{props.children}</>;
    } else {
        return null;
    }
}
