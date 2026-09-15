import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingStateProps = {
  label?: string;
  fullScreen?: boolean;
};

export function LoadingState({ label = "جاري التحميل...", fullScreen = false }: LoadingStateProps) {
  return (
    <div className={cn("flex items-center justify-center gap-3 text-muted-foreground", fullScreen && "min-h-dvh")}>
      <Loader2 aria-hidden="true" className="size-5 animate-spin text-primary" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
