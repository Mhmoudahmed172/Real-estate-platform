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

  return (
    <motion.div {...fadeItem} {...cardHover}>
      <Card className="h-full">
        <CardContent className="flex h-full flex-col gap-4 px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary-soft text-primary">
              <Icon aria-hidden="true" className="size-4" />
            </span>
          </div>
          <p className={cn("font-numeric text-kpi text-foreground", kpi.value === null && "text-muted-foreground")}>
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
