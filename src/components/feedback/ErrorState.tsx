import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title: string;
  description?: string;
  onRetry?: () => void;
  compact?: boolean;
};

export function ErrorState({ title, description, onRetry, compact = false }: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl text-center",
        compact ? "bg-destructive/5 px-3 py-5" : "min-h-[320px] border border-destructive/15 bg-destructive/5 px-6",
      )}
    >
      <AlertTriangle aria-hidden="true" className={cn("text-destructive", compact ? "mb-2 size-5" : "mb-4 size-9")} />
      {compact ? (
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      ) : (
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      )}
      {description ? (
        <p className={cn("text-muted-foreground", compact ? "mt-1 max-w-sm text-xs leading-5" : "mt-2 max-w-xl text-sm leading-7")}>
          {description}
        </p>
      ) : null}
      {onRetry ? (
        <Button className={cn("rounded-full", compact ? "mt-3" : "mt-6")} size="sm" variant="outline" onClick={onRetry}>
          إعادة المحاولة
        </Button>
      ) : null}
    </div>
  );
}
