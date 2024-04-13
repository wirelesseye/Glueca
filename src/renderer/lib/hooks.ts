import { useState } from "react";

export function useForceUpdate() {
    const f = useState(0)[1];
    return () => f((v) => v + 1);
}
