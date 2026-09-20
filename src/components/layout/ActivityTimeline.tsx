import type { ReactNode } from "react";
import { EmptyState } from "@/components/feedback/EmptyState";

export type TimelineItem = {
  id: string;
  title: string;
  description?: string | null;
  meta?: ReactNode;
  timestamp?: string | null;
};

type ActivityTimelineProps = {
  items: TimelineItem[];
  emptyTitle: string;
  emptyDescription?: string;
};

export function ActivityTimeline({ items, emptyTitle, emptyDescription }: ActivityTimelineProps) {
  if (items.length === 0) {
    return <EmptyState compact description={emptyDescription} title={emptyTitle} />;
  }

  return (
    <ol className="space-y-3">
      {items.map((item) => (
        <li className="relative flex gap-3 ps-2" key={item.id}>
          <span aria-hidden="true" className="mt-1.5 size-2.5 shrink-0 rounded-full bg-primary" />
          <div className="min-w-0 flex-1 rounded-xl border border-border/80 bg-muted/30 px-3 py-2.5">
            <p className="text-sm font-semibold leading-6 text-foreground">{item.title}</p>
            {item.description ? <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{item.description}</p> : null}
            {item.meta ? <div className="mt-1 text-meta">{item.meta}</div> : null}
            {item.timestamp ? <p className="mt-1 text-meta">{item.timestamp}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
