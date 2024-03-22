/** @jsxImportSource @emotion/react */

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { css } from "@emotion/react";

const Checkbox = React.forwardRef<
    React.ElementRef<typeof CheckboxPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
            `peer h-4 w-4 shrink-0 cursor-default rounded-sm text-white
            ring-offset-background focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-ring focus-visible:ring-offset-2 active:brightness-125
            disabled:cursor-not-allowed disabled:opacity-50`,
            className,
        )}
        css={css`
            box-shadow:
                0 0px 2px rgba(0, 0, 0, 0.3),
                inset 0 1px rgba(255, 255, 255, 0.1);
            background: var(--checkbox);
            &[data-state="checked"] {
                background: linear-gradient(
                    to bottom,
                    hsl(var(--accent)),
                    hsl(var(--accent-darken))
                );
            }
        `}
        {...props}
    >
        <CheckboxPrimitive.Indicator
            className={cn("flex items-center justify-center text-current")}
        >
            <Check className="h-3 w-3" strokeWidth={4} />
        </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
