import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DetailItemProps = {
  label: string;
  value: ReactNode;
  important?: boolean;
  numeric?: boolean;
  className?: string;
};

type DetailGridProps = {
  children: ReactNode;
  className?: string;
};

export function DetailGrid({ children, className }: DetailGridProps) {
  return <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-3", className)}>{children}</div>;
}

export function DetailItem({ label, value, important = false, numeric = false, className }: DetailItemProps) {
  const isEmpty = value === null || value === undefined || value === "";

  return (
    <div className={cn("min-w-0 rounded-xl border border-border/80 bg-muted/30 px-4 py-3", important && "border-primary/20 bg-primary-soft/70", className)}>
      <p className="text-meta">{label}</p>
      <p className={cn("mt-1 min-w-0 [overflow-wrap:anywhere] text-sm font-semibold leading-6 text-foreground", numeric && "font-numeric tabular-nums", important && "text-base")}>{isEmpty ? "—" : value}</p>
    </div>
  );
}

