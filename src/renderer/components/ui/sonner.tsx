import { useDarkTheme } from "@/lib/theme";
import { Toaster as Sonner } from "sonner";
import ThemeContainer from "../ThemeContainer";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
    const dark = useDarkTheme();

    return (
        <ThemeContainer dark={dark}>
            <Sonner
                className="toaster group w-60"
                toastOptions={{
                    classNames: {
                        toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg w-60",
                        icon: "mr-2",
                        description: "group-[.toast]:text-muted-foreground",
                        actionButton:
                            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                        cancelButton:
                            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                    },
                }}
                {...props}
            />
        </ThemeContainer>
    );
};

export { Toaster };
