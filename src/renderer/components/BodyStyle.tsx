import { createContext, useContext, useEffect } from "react";

const BodyStyleContext = createContext({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setBodyClassName: (className: string) => {}
});

export const BodyStyleProvider = BodyStyleContext.Provider;

interface BodyStyleProps {
    className: string;
}

export default function BodyStyle({ className }: BodyStyleProps) {
    const { setBodyClassName } = useContext(BodyStyleContext);

    useEffect(() => {
        setBodyClassName(className);
    }, [className])

    return null;
}
