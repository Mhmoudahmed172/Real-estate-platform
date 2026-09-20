import { Filter } from "lucide-react";

export function ActiveFilterBanner({ label, description }: { label: string; description?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary-soft/70 px-4 py-3">
      <Filter aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {description ? <p className="mt-0.5 text-meta">{description}</p> : null}
      </div>
    </div>
  );
}
