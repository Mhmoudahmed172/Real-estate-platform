import { Braces } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";

type JsonPreviewProps = {
  rows: unknown[];
  emptyTitle: string;
  emptyDescription?: string;
};

export function JsonPreview({ rows, emptyTitle, emptyDescription = "لم يرجع الخادم سجلات لهذا القسم." }: JsonPreviewProps) {
  if (rows.length === 0) return <EmptyState compact title={emptyTitle} description={emptyDescription} />;

  return (
    <div className="space-y-2">
      {rows.map((row, index) => (
        <div key={index} className="rounded-xl border border-border/80 bg-muted/30 p-3">
          <div className="mb-2 flex items-center gap-2 text-meta">
            <Braces aria-hidden="true" className="size-3.5 text-primary" />
            <span>سجل #{index + 1}</span>
          </div>
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-card p-3 text-left font-numeric text-xs leading-5 text-foreground direction-ltr">
            {JSON.stringify(row, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
}
