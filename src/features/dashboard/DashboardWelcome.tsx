import { Building2, CalendarDays, FilePlus2, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Can } from "@/app/guards/Can";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/useAuth";

type DashboardWelcomeProps = {
  periodLabel: string;
};

export function DashboardWelcome({ periodLabel }: DashboardWelcomeProps) {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(" ")[0] ?? "بك";

  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 space-y-2.5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">لوحة القيادة التنفيذية</p>
        <h1 className="text-page text-foreground">مرحباً، {firstName}</h1>
        <p className="max-w-xl text-sm leading-7 text-muted-foreground">
          نظرة تشغيلية على المحفظة العقارية من الوحدات والعقود والدفعات المتاحة حالياً.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-3.5 text-xs font-medium text-muted-foreground shadow-sm">
          <CalendarDays aria-hidden="true" className="size-3.5 text-primary" />
          <span>{periodLabel}</span>
        </div>
        <Can permission="reports.export">
          <Button asChild className="rounded-full" size="sm" variant="outline">
            <Link to="/reports">
              <Download aria-hidden="true" className="size-3.5" />
              تصدير تقرير
            </Link>
          </Button>
        </Can>
        <Can permission="contracts.create">
          <Button asChild className="rounded-full" size="sm" variant="outline">
            <Link to="/contracts/new">
              <FilePlus2 aria-hidden="true" className="size-3.5" />
              إنشاء عقد
            </Link>
          </Button>
        </Can>
        <Can permission="properties.create">
          <Button asChild className="rounded-full shadow-sm" size="sm">
            <Link to="/properties/new">
              <Building2 aria-hidden="true" className="size-3.5" />
              إضافة عقار
            </Link>
          </Button>
        </Can>
      </div>
    </header>
  );
}
