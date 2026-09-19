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

const accentVariants = {
  properties: {
    icon: "bg-primary-soft text-primary ring-primary/15",
    bar: "bg-primary",
  },
  occupancy: {
    icon: "bg-success/10 text-success ring-success/15",
    bar: "bg-success",
  },
  "rented-units": {
    icon: "bg-navy/10 text-navy ring-navy/15",
    bar: "bg-navy",
  },
  collected: {
    icon: "bg-secondary-soft text-[#8A5D12] ring-warning/20",
    bar: "bg-warning",
  },
} as const;

type DashboardKpiCardProps = {
  kpi: DashboardKpi;
  icon: LucideIcon;
};

export function DashboardKpiCard({ kpi, icon: Icon }: DashboardKpiCardProps) {
  const formatValue = (value: number) => {
    if (kpi.format === "currency") return formatCurrency(Math.round(value));
    if (kpi.format === "percent") return formatPercent(value);
    return formatNumber(Math.round(value));
  };
  const accent = accentVariants[kpi.id as keyof typeof accentVariants] ?? accentVariants.properties;

  return (
    <motion.div {...fadeItem} {...cardHover}>
      <Card className="relative h-full overflow-hidden hover:shadow-card-hover">
        <span className={cn("absolute inset-x-0 top-0 h-1", accent.bar)} />
        <CardContent className="flex h-full flex-col gap-4 px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-muted-foreground">{kpi.label}</p>
            <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-[12px] ring-1", accent.icon)}>
              <Icon aria-hidden="true" className="size-[18px]" />
            </span>
          </div>
          <p className={cn("font-numeric text-kpi text-navy", kpi.value === null && "text-muted-foreground")}>
            {kpi.value === null ? "—" : <AnimatedNumber format={formatValue} value={kpi.value} />}
          </p>
          <div className="mt-auto flex min-h-6 flex-wrap items-center gap-1.5">
            {kpi.footer.slice(0, 2).map((item) => (
              <Badge key={item.label} className="min-h-6 px-2 text-[10.5px]" variant={toneVariants[item.tone]}>
                {item.label}
              </Badge>
            ))}
            {!kpi.mapped ? (
              <Badge className="min-h-6 px-2 text-[10.5px]" variant="muted">
                غير متاح
              </Badge>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
