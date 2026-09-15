import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "danger" | "muted";
};

const variants = {
  default: "border-primary/20 bg-primary/10 text-primary",
  success: "border-success/20 bg-success/10 text-success",
  warning: "border-warning/25 bg-warning/15 text-warning",
  danger: "border-destructive/20 bg-destructive/10 text-destructive",
  muted: "border-border bg-muted text-muted-foreground",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex min-h-6 max-w-full items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-5", variants[variant], className)}
      {...props}
    />
  );
}
