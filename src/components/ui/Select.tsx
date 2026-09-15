import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;
export const SelectGroup = SelectPrimitive.Group;

export const SelectTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    className={cn(
      "flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-input bg-card px-3.5 text-sm text-foreground transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground",
      className,
    )}
    ref={ref}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown aria-hidden="true" className="size-4 text-muted-foreground" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

export const SelectContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      className={cn(
        "z-50 max-h-72 min-w-[8rem] overflow-hidden rounded-md border border-border bg-card text-foreground shadow-popover",
        className,
      )}
      position={position}
      ref={ref}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = "SelectContent";

export const SelectItem = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    className={cn(
      "relative flex min-h-9 cursor-pointer select-none items-center rounded-sm px-8 text-sm outline-none focus:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    ref={ref}
    {...props}
  >
    <SelectPrimitive.ItemIndicator className="absolute right-2">
      <Check aria-hidden="true" className="size-4 text-primary" />
    </SelectPrimitive.ItemIndicator>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";
