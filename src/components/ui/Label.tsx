import * as LabelPrimitive from "@radix-ui/react-label";
import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Label = forwardRef<HTMLLabelElement, ComponentPropsWithoutRef<typeof LabelPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <LabelPrimitive.Root className={cn("text-sm font-medium text-foreground", className)} ref={ref} {...props} />
  ),
);

Label.displayName = "Label";
