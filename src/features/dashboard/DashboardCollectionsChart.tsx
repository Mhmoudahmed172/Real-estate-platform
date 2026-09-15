import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { fadeItem } from "@/lib/motion";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { CollectionPoint } from "@/features/dashboard/dashboardAdapter";

type DashboardCollectionsChartProps = {
  points: CollectionPoint[];
  mapped: boolean;
  collectedYtd: number | null;
  occupancyPercent: number | null;
};

export function DashboardCollectionsChart({
  points,
  mapped,
  collectedYtd,
  occupancyPercent,
}: DashboardCollectionsChartProps) {
  const hasValues = points.some((point) => point.collected > 0);
  const year = new Date().getFullYear();
  const showChart = mapped && hasValues;

  return (
    <motion.div className="h-full" {...fadeItem}>
      <Card className="flex h-full flex-col">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>مؤشر الإيرادات والتحصيل السنوي</CardTitle>
            <p className="text-meta">مقارنة التحصيل الشهري من الدفعات ذات تاريخ السداد</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-meta sm:flex">
              <span className="size-2 rounded-full bg-primary" />
              المحصل
            </span>
            <Badge variant="muted">YTD {year}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          <div className="relative h-[280px] w-full">
            <motion.div
              className="h-full w-full"
              dir="ltr"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.28 }}
            >
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={points} barSize={22} barGap={8}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 6" vertical={false} />
                  <XAxis axisLine={false} dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                  <YAxis
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value: number) => formatCurrency(value)}
                    tickLine={false}
                    width={78}
                  />
                  {showChart ? (
                    <Tooltip
                      contentStyle={{ borderRadius: 12, borderColor: "hsl(var(--border))" }}
                      formatter={(value) => [formatCurrency(Number(value ?? 0)), "المحصل"]}
                    />
                  ) : null}
                  <Bar dataKey="collected" fill="hsl(var(--primary))" name="المحصل" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
            {showChart ? null : (
              <div className="absolute inset-0 flex items-center justify-center bg-card/55">
                <p className="rounded-full bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                  لا تتوفر سلسلة تحصيل شهرية بعد
                </p>
              </div>
            )}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
            <div>
              <p className="text-meta">المحصل YTD</p>
              <p className="mt-1 font-numeric text-sm font-bold text-foreground">
                {collectedYtd === null ? "—" : formatCurrency(collectedYtd)}
              </p>
            </div>
            <div>
              <p className="text-meta">معدل الإشغال</p>
              <p className="mt-1 font-numeric text-sm font-bold text-foreground">
                {occupancyPercent === null ? "—" : formatPercent(occupancyPercent)}
              </p>
            </div>
            <div>
              <p className="text-meta">حالة السلسلة</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{showChart ? "متصلة" : "بانتظار الدفعات"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
