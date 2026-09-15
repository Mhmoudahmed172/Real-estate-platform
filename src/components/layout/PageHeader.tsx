import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, eyebrow, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0 space-y-2">
        {eyebrow ? <p className="text-xs font-semibold text-primary">{eyebrow}</p> : null}
        <h1 className="text-page text-foreground">{title}</h1>
        {description ? <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
