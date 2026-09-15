import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <section
    className={cn(
      "rounded-xl border border-border/80 bg-card text-card-foreground shadow-card transition-shadow duration-base",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div className={cn("space-y-1.5 p-5 pb-4 sm:p-6 sm:pb-4", className)} ref={ref} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 className={cn("text-section tracking-normal text-foreground", className)} ref={ref} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div className={cn("p-5 pt-0 sm:p-6 sm:pt-0", className)} ref={ref} {...props} />
));
CardContent.displayName = "CardContent";
