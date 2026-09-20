import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { cardHover, fadeItem } from "@/lib/motion";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DashboardKpi } from "@/features/dashboard/dashboardAdapter";

const footerToneVariants = {
  muted: "bg-muted-foreground/45",
  success: "bg-success",
  danger: "bg-destructive",
  warning: "bg-warning",
} as const;

const accentVariants = {
  overdue: { icon: "bg-destructive/10 text-destructive ring-destructive/15", accent: "bg-destructive" },
  "due-this-month": { icon: "bg-primary-soft text-primary ring-primary/15", accent: "bg-primary" },
  "vacant-over-30": { icon: "bg-secondary-soft text-[#8A5D12] ring-warning/20", accent: "bg-warning" },
  expiring: { icon: "bg-navy/10 text-navy ring-navy/15", accent: "bg-navy" },
  "expected-vs-collected": { icon: "bg-success/10 text-success ring-success/15", accent: "bg-success" },
  "net-collection": { icon: "bg-primary-soft text-primary ring-primary/15", accent: "bg-primary" },
  "urgent-maintenance": { icon: "bg-destructive/10 text-destructive ring-destructive/15", accent: "bg-destructive" },
  "overdue-maintenance": { icon: "bg-secondary-soft text-[#8A5D12] ring-warning/20", accent: "bg-warning" },
  properties: { icon: "bg-primary-soft text-primary ring-primary/15", accent: "bg-primary" },
  occupancy: { icon: "bg-success/10 text-success ring-success/15", accent: "bg-success" },
  "rented-units": { icon: "bg-navy/10 text-navy ring-navy/15", accent: "bg-navy" },
  collected: { icon: "bg-secondary-soft text-[#8A5D12] ring-warning/20", accent: "bg-warning" },
} as const;

type DashboardKpiCardProps = {
  kpi: DashboardKpi;
  icon: LucideIcon;
  compact?: boolean;
};

export function DashboardKpiCard({ kpi, icon: Icon, compact = false }: DashboardKpiCardProps) {
  const formatValue = (value: number) => {
    if (kpi.format === "currency") return formatCurrency(Math.round(value));
    if (kpi.format === "percent") return formatPercent(value);
    return formatNumber(Math.round(value));
  };
  const accent = accentVariants[kpi.id as keyof typeof accentVariants] ?? accentVariants.properties;

  const card = (
    <Card className={cn(
      "group relative flex h-full flex-col overflow-hidden transition-[border-color,box-shadow]",
      compact ? "min-h-[132px]" : "min-h-[184px]",
      kpi.href && "hover:border-primary/20 hover:shadow-card-hover",
    )}>
      <span className={cn("absolute inset-x-0 top-0 h-[3px]", accent.accent)} />
      <CardContent className={cn("flex min-h-0 flex-1 flex-col px-5 pb-0 pt-5", compact && "pt-4")}>
        <div className={cn("flex items-start justify-between gap-3", compact ? "min-h-8" : "min-h-12")}>
          <p className="min-w-0 flex-1 pt-0.5 text-[13px] font-semibold leading-5 text-muted-foreground">
            {kpi.label}
          </p>
          <span className={cn("flex shrink-0 items-center justify-center rounded-2xl ring-1", compact ? "size-9" : "size-12", accent.icon)}>
            <Icon aria-hidden="true" className={compact ? "size-4" : "size-[22px]"} strokeWidth={1.9} />
          </span>
        </div>
        <div className={cn("flex flex-1 items-center py-2", compact ? "min-h-10" : "min-h-14")}>
          <p className={cn(
            "whitespace-nowrap font-numeric font-bold leading-none text-navy",
            compact ? "text-xl" : "text-[2rem] lg:text-[2.125rem]",
            kpi.value === null && "text-muted-foreground",
          )}>
            {kpi.value === null ? "—" : <AnimatedNumber format={formatValue} value={kpi.value} />}
          </p>
        </div>
        <div className="-mx-5 mt-auto flex min-h-[40px] flex-nowrap items-center gap-x-2 overflow-hidden border-t border-border/70 bg-muted/45 px-5 py-2.5">
          {kpi.footer.slice(0, 2).map((item) => (
            <span key={item.label} className="inline-flex min-w-0 items-center gap-1.5 text-[11px] font-medium leading-5 text-muted-foreground">
              <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", footerToneVariants[item.tone])} />
              <span className="truncate" title={item.label}>{item.label}</span>
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <motion.div {...fadeItem} {...(kpi.href ? cardHover : {})}>
      {kpi.href ? (
        <Link className="block h-full focus-visible:outline-none" to={kpi.href}>
          {card}
        </Link>
      ) : card}
    </motion.div>
  );
}
