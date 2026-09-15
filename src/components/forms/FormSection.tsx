import type { PropsWithChildren } from "react";

type FormSectionProps = PropsWithChildren<{
  title: string;
  description?: string;
}>;

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="space-y-4 rounded-xl border border-border/80 bg-muted/30 p-5">
      <div>
        <h2 className="text-section text-foreground">{title}</h2>
        {description ? <p className="mt-1 text-meta">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
