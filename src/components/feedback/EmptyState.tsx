import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
};

export function EmptyState({ title, description, action, compact = false }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact
          ? "rounded-lg bg-muted/35 px-4 py-5"
          : "rounded-xl border border-dashed border-border bg-muted/35 px-6 py-10",
      )}
    >
      {compact ? null : <Inbox aria-hidden="true" className="mb-3 size-7 text-muted-foreground" />}
      <h2 className={cn("font-semibold text-foreground", compact ? "text-sm" : "text-base")}>{title}</h2>
      {description ? (
        <p className={cn("text-muted-foreground", compact ? "mt-1 max-w-md text-xs leading-5" : "mt-2 max-w-xl text-sm leading-7")}>
          {description}
        </p>
      ) : null}
      {action ? <div className={cn(compact ? "mt-3" : "mt-4")}>{action}</div> : null}
    </div>
  );
}
