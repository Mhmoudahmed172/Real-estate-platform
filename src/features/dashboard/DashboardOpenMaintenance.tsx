import { motion } from "framer-motion";
import { Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MaintenancePriorityBadge, MaintenanceStatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { fadeItem } from "@/lib/motion";
import type { DashboardViewModel } from "@/features/dashboard/dashboardAdapter";

type DashboardOpenMaintenanceProps = {
  rows: DashboardViewModel["openMaintenance"];
};

export function DashboardOpenMaintenance({ rows }: DashboardOpenMaintenanceProps) {
  return (
    <motion.div className="h-full" {...fadeItem}>
      <Card className="flex h-full flex-col">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
          <div className="flex items-start gap-3">
            <span className="flex size-9 items-center justify-center rounded-[10px] bg-muted text-navy">
              <Wrench aria-hidden="true" className="size-4" />
            </span>
            <div>
              <CardTitle>البلاغات المفتوحة</CardTitle>
              <p className="mt-1 text-meta">حالات جديدة أو قيد التنفيذ</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="muted">{rows.length}</Badge>
            <Link className="text-xs font-semibold text-primary hover:underline" to="/maintenance">
              عرض الكل
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {rows.length === 0 ? (
            <EmptyState compact description="لا توجد بلاغات مفتوحة ضمن الصفحة المحمّلة." title="لا بلاغات مفتوحة" />
          ) : (
            rows.map((row) => (
              <div key={row.request.id} className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-card text-navy shadow-sm">
                  <Wrench aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{row.request.issue_type}</p>
                  <p className="truncate text-meta">{row.propertyName}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                  <MaintenanceStatusBadge status={row.request.status} />
                  {row.request.priority ? <MaintenancePriorityBadge priority={row.request.priority} /> : null}
                </div>
                <Button asChild className="hidden rounded-full sm:inline-flex" size="sm" variant="outline">
                  <Link to="/maintenance">متابعة</Link>
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
