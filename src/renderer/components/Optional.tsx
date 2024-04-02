import { ReactNode } from "react";

interface OptionalProps {
    show: boolean;
    children?: ReactNode;
}

export default function Optional(props: OptionalProps) {
    if (props.show) {
        return <>{props.children}</>;
    } else {
        return null;
    }
}
