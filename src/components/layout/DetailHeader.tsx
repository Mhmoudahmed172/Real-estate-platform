import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ActionMenu, type ActionMenuItem } from "@/components/ui/ActionMenu";
import { Button } from "@/components/ui/Button";

type DetailHeaderProps = {
  backTo: string;
  backLabel: string;
  eyebrow: string;
  title: string;
  badges?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  primaryAction?: ReactNode;
  menuItems?: ActionMenuItem[];
};

export function DetailHeader({
  backTo,
  backLabel,
  eyebrow,
  title,
  badges,
  description,
  icon,
  primaryAction,
  menuItems = [],
}: DetailHeaderProps) {
  return (
    <header className="space-y-3">
      <Button asChild className="h-8 px-2 text-muted-foreground" size="sm" variant="ghost">
        <Link to={backTo}>
          <ArrowRight aria-hidden="true" className="size-4" />
          {backLabel}
        </Link>
      </Button>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {icon}
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-semibold text-primary">{eyebrow}</p>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h1 className="text-page text-foreground">{title}</h1>
              {badges}
            </div>
            {description ? <div className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</div> : null}
          </div>
        </div>
        {primaryAction || menuItems.length > 0 ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {primaryAction}
            <ActionMenu items={menuItems} />
          </div>
        ) : null}
      </div>
    </header>
  );
}
