import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { cardHover, fadeItem } from "@/lib/motion";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DashboardKpi } from "@/features/dashboard/dashboardAdapter";

const toneVariants = {
  muted: "muted",
  success: "success",
  danger: "danger",
  warning: "warning",
} as const;

const accents = {
  properties: {
    tile: "bg-primary-soft text-primary ring-primary/10",
    bar: "bg-primary",
  },
  occupancy: {
    tile: "bg-tertiary-soft text-tertiary ring-tertiary/10",
    bar: "bg-tertiary",
  },
  "rented-units": {
    tile: "bg-primary-soft text-primary ring-primary/10",
    bar: "bg-primary",
  },
  collected: {
    tile: "bg-secondary-soft text-secondary ring-secondary/10",
    bar: "bg-secondary",
  },
} as const;

type DashboardKpiCardProps = {
  kpi: DashboardKpi;
  icon: LucideIcon;
};

export function DashboardKpiCard({ kpi, icon: Icon }: DashboardKpiCardProps) {
  const accent = accents[kpi.id as keyof typeof accents] ?? accents.properties;
  const isCollected = kpi.id === "collected";
  const chipClassName = cn(
    "py-0 leading-none",
    isCollected ? "min-h-6 px-2.5 text-[10.5px]" : "min-h-7 px-3 text-[11px]",
  );
  const formatValue = (value: number) => {
    if (kpi.format === "currency") return formatCurrency(Math.round(value));
    if (kpi.format === "percent") return formatPercent(value);
    return formatNumber(Math.round(value));
  };

  return (
    <motion.div className="sm:h-[204px]" {...fadeItem} {...cardHover}>
      <Card className="relative h-full min-h-[166px] overflow-hidden border-border/90 shadow-[0_1px_2px_rgb(15_23_42_/_0.035),0_10px_24px_rgb(15_23_42_/_0.045)]">
        <span className={cn("absolute inset-x-0 top-0 h-[3px] rounded-t-xl", accent.bar)} />
        <CardContent className={cn("flex flex-col px-5 sm:px-6", isCollected ? "py-3.5 sm:py-4" : "py-4 sm:py-[18px]")}>
          <header className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[15px] font-semibold leading-6 text-slate-700">{kpi.label}</p>
            </div>
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 sm:size-11",
                accent.tile,
              )}
            >
              <Icon aria-hidden="true" className="size-5" />
            </span>
          </header>

          <main className={cn("flex min-h-10 items-center", isCollected ? "mt-3" : "mt-4")}>
            <p
              className={cn(
                "font-numeric text-[2.375rem] font-bold leading-none text-foreground tabular-nums",
                kpi.value === null && "text-[2.5rem] text-slate-500",
              )}
            >
              {kpi.value === null ? "—" : <AnimatedNumber format={formatValue} value={kpi.value} />}
            </p>
          </main>

          <footer className={cn("flex min-h-7 flex-wrap items-center", isCollected ? "mt-3 gap-1.5" : "mt-4 gap-2")}>
            {kpi.footer.slice(0, 2).map((item) => (
              <Badge key={item.label} className={chipClassName} variant={toneVariants[item.tone]}>
                {item.label}
              </Badge>
            ))}
            {!kpi.mapped ? (
              <Badge className={chipClassName} variant="muted">
                غير متاح
              </Badge>
            ) : null}
          </footer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
