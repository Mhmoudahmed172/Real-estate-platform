import { motion } from "framer-motion";
import { CalendarClock, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ContractStatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { fadeItem } from "@/lib/motion";
import { formatCurrency, formatDate, parseMoney } from "@/lib/format";
import type { DashboardViewModel } from "@/features/dashboard/dashboardAdapter";

type DashboardExpiringContractsProps = {
  rows: DashboardViewModel["expiringContracts"];
};

export function DashboardExpiringContracts({ rows }: DashboardExpiringContractsProps) {
  return (
    <motion.div className="h-full" {...fadeItem}>
      <Card className="flex h-full flex-col">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
          <div className="flex items-start gap-3">
            <span className="flex size-9 items-center justify-center rounded-[10px] bg-primary-soft text-primary">
              <CalendarClock aria-hidden="true" className="size-4" />
            </span>
            <div>
              <CardTitle>العقود القريبة للانتهاء</CardTitle>
              <p className="mt-1 text-meta">نافذة التجديد خلال 30 يوماً</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="muted">{rows.length}</Badge>
            <Link className="text-xs font-semibold text-primary hover:underline" to="/contracts">
              عرض الكل
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {rows.length === 0 ? (
            <EmptyState compact description="لا توجد عقود منتهية قريباً ضمن النافذة الحالية." title="لا عقود قريبة للانتهاء" />
          ) : (
            rows.map((row) => {
              const rent = parseMoney(row.contract.rent_value);
              return (
                <div key={row.contract.id} className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-card text-primary shadow-sm">
                    <FileText aria-hidden="true" className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{row.tenantName}</p>
                    <p className="truncate text-meta">
                      {row.unitLabel} · {row.propertyName} · {rent === null ? row.contract.rent_value : formatCurrency(rent)}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-end sm:block">
                    <p className="text-meta">الانتهاء</p>
                    <p className="text-xs font-medium text-foreground">{formatDate(row.contract.end_date)}</p>
                  </div>
                  <ContractStatusBadge status={row.contract.status} />
                  <Button asChild className="hidden rounded-full sm:inline-flex" size="sm" variant="outline">
                    <Link to="/contracts">متابعة</Link>
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
