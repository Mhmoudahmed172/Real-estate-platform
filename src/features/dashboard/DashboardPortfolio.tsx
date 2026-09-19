import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { fadeItem } from "@/lib/motion";
import { formatNumber, formatPercent } from "@/lib/format";
import { propertyTypeLabels } from "@/lib/labels";
import type { PortfolioSegment } from "@/features/dashboard/dashboardAdapter";
import type { PropertyOut } from "@/types/resources";

const barColors = ["bg-primary", "bg-navy", "bg-success", "bg-warning"];

type DashboardPortfolioProps = {
  segments: PortfolioSegment[];
  featuredProperty: PropertyOut | null;
};

export function DashboardPortfolio({ segments, featuredProperty }: DashboardPortfolioProps) {
  const totalUnits = segments.reduce((sum, segment) => sum + segment.unitsCount, 0);

  return (
    <motion.div className="h-full" {...fadeItem}>
      <Card className="flex h-full flex-col overflow-hidden">
        <CardHeader className="border-b border-border/70 pb-4">
          <CardTitle>توزيع المحفظة حسب النوع</CardTitle>
          <p className="text-meta">تجميع العقارات حسب النوع ونسبة الوحدات المؤجرة</p>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-between gap-5 pt-5">
          {segments.length === 0 ? (
            <div className="space-y-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="h-2 w-20 rounded-full bg-muted" />
                    <span className="font-numeric text-meta">—</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted" />
                </div>
              ))}
              <p className="text-meta">أضف عقارات لعرض توزيع المحفظة.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {segments.map((segment, index) => (
                <div key={segment.type} className="space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={`size-2.5 shrink-0 rounded-full ${barColors[index % barColors.length]}`} />
                      <span className="truncate text-sm font-semibold text-navy">{segment.label}</span>
                    </div>
                    <span className="font-numeric text-sm font-extrabold text-navy">
                      {segment.occupancy === null ? "—" : formatPercent(segment.occupancy)}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#E7EDEA]">
                    <div
                      className={`h-full rounded-full ${barColors[index % barColors.length]}`}
                      style={{ width: `${Math.min(segment.occupancy ?? 0, 100)}%` }}
                    />
                  </div>
                  <p className="text-meta">
                    {formatNumber(segment.propertyCount)} عقار · {formatNumber(segment.occupiedUnits)}/{formatNumber(segment.unitsCount)} وحدة مؤجرة
                    {totalUnits > 0 ? ` · ${formatPercent((segment.unitsCount / totalUnits) * 100)} من الوحدات` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
          {featuredProperty ? (
            <Link
              className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-3.5 shadow-sm transition-colors duration-fast hover:bg-primary-soft/50"
              to={`/properties/${featuredProperty.id}`}
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary ring-1 ring-primary/10">
                <Building2 aria-hidden="true" className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-navy">{featuredProperty.name}</p>
                <p className="truncate text-meta">
                  {featuredProperty.city ?? "بدون مدينة"} · {propertyTypeLabels[featuredProperty.property_type]}
                </p>
              </div>
              <Badge variant="success">{formatNumber(featuredProperty.units_count)} وحدة</Badge>
            </Link>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
