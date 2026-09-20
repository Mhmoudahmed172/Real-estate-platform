import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { ReportKind } from "@/types/domain";

type ChartRow = Record<string, string | number | null>;

const chartSettings: Partial<Record<ReportKind, {
  title: string;
  category: string;
  series: Array<{ key: string; label: string; color: string; currency?: boolean }>;
}>> = {
  collections: {
    title: "المستحق مقابل المحصل شهريًا",
    category: "month",
    series: [
      { key: "amount_due", label: "المستحق", color: "#173057", currency: true },
      { key: "amount_paid", label: "المحصل", color: "#087F73", currency: true },
    ],
  },
  occupancy: {
    title: "توزيع حالات الوحدات",
    category: "status",
    series: [{ key: "count", label: "الوحدات", color: "#087F73" }],
  },
  "maintenance-costs": {
    title: "تكلفة الصيانة حسب العقار",
    category: "property_name",
    series: [{ key: "total_cost", label: "التكلفة", color: "#D89B32", currency: true }],
  },
  "property-performance": {
    title: "التحصيل مقابل تكلفة الصيانة",
    category: "property_name",
    series: [
      { key: "amount_paid", label: "المحصل", color: "#087F73", currency: true },
      { key: "maintenance_cost", label: "الصيانة", color: "#D89B32", currency: true },
    ],
  },
};

export function ReportChart({ kind, rows }: { kind: ReportKind; rows: ChartRow[] }) {
  const settings = chartSettings[kind];
  if (!settings || rows.length === 0) return null;

  const data = rows.map((row) => Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key,
      typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value) ? Number(value) : value,
    ]),
  ));

  return (
    <Card>
      <CardHeader className="border-b border-border/70 pb-4">
        <CardTitle>{settings.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="h-[280px] w-full" dir="ltr">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 6" vertical={false} />
              <XAxis axisLine={false} dataKey={settings.category} tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(value: number) => formatNumber(value)} tickLine={false} />
              <Tooltip
                formatter={(value, name) => {
                  const series = settings.series.find((item) => item.key === name);
                  return [series?.currency ? formatCurrency(Number(value)) : formatNumber(Number(value)), series?.label ?? name];
                }}
              />
              {settings.series.map((series) => (
                <Bar key={series.key} dataKey={series.key} fill={series.color} name={series.key} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
