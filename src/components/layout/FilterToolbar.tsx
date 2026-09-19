import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FilterToolbarProps = {
  children: ReactNode;
  className?: string;
};

export function FilterToolbar({ children, className }: FilterToolbarProps) {
  return (
    <section className={cn("grid gap-3 rounded-[14px] border border-border bg-card px-4 py-3 shadow-card md:items-end", className)}>
      {children}
    </section>
  );
}
