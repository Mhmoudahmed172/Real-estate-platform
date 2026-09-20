import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <section
    className={cn(
      "rounded-2xl border border-border bg-card text-card-foreground shadow-card transition-shadow duration-base",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div className={cn("space-y-1 p-4 pb-3 sm:p-5 sm:pb-4", className)} ref={ref} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 className={cn("text-section tracking-normal text-navy", className)} ref={ref} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div className={cn("p-4 pt-0 sm:p-5 sm:pt-0", className)} ref={ref} {...props} />
));
CardContent.displayName = "CardContent";
