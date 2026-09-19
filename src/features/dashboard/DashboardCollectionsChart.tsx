import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
      <Card className="flex h-full flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 border-b border-border/70 pb-4">
          <div className="space-y-1">
            <CardTitle>الإيرادات والتحصيل</CardTitle>
            <p className="text-meta">التحصيل الشهري من الدفعات ذات تاريخ السداد</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-meta sm:flex">
              <span className="size-2 rounded-full bg-primary" />
              المحصل
            </span>
            <Badge variant="muted">YTD {year}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col pt-5">
          <div className="relative h-[280px] w-full">
            <motion.div
              className="h-full w-full"
              dir="ltr"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.28 }}
            >
              <ResponsiveContainer height="100%" width="100%">
                <AreaChart data={points} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="collectionsGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#087F73" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#087F73" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 7" vertical={false} />
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
                      cursor={{ stroke: "#087F73", strokeOpacity: 0.18, strokeWidth: 2 }}
                      contentStyle={{
                        borderRadius: 14,
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--card))",
                        boxShadow: "var(--shadow-popover)",
                        color: "hsl(var(--foreground))",
                        fontSize: 12,
                      }}
                      formatter={(value) => [formatCurrency(Number(value ?? 0)), "المحصل"]}
                    />
                  ) : null}
                  <Area
                    activeDot={{ r: 5, stroke: "#FFFFFF", strokeWidth: 2 }}
                    dataKey="collected"
                    fill="url(#collectionsGradient)"
                    name="المحصل"
                    stroke="#087F73"
                    strokeWidth={3}
                    type="monotone"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
            {showChart ? null : (
              <div className="absolute inset-0 flex items-center justify-center bg-card/65 backdrop-blur-[1px]">
                <p className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                  لا تتوفر سلسلة تحصيل شهرية بعد
                </p>
              </div>
            )}
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-3">
            <div className="rounded-xl bg-muted/50 px-3 py-2.5">
              <p className="text-meta">المحصل YTD</p>
              <p className="mt-1 font-numeric text-sm font-bold text-navy">
                {collectedYtd === null ? "—" : formatCurrency(collectedYtd)}
              </p>
            </div>
            <div className="rounded-xl bg-muted/50 px-3 py-2.5">
              <p className="text-meta">معدل الإشغال</p>
              <p className="mt-1 font-numeric text-sm font-bold text-navy">
                {occupancyPercent === null ? "—" : formatPercent(occupancyPercent)}
              </p>
            </div>
            <div className="rounded-xl bg-muted/50 px-3 py-2.5">
              <p className="text-meta">حالة السلسلة</p>
              <p className="mt-1 text-sm font-semibold text-navy">{showChart ? "متصلة" : "بانتظار الدفعات"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
