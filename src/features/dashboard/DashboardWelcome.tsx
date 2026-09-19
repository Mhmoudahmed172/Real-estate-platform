import { Building2, CalendarDays, FilePlus2, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Can } from "@/app/guards/Can";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/useAuth";

type DashboardWelcomeProps = {
  periodLabel: string;
};

export function DashboardWelcome({ periodLabel }: DashboardWelcomeProps) {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(" ")[0] ?? "بك";

  return (
    <header className="overflow-hidden rounded-2xl border border-white/70 bg-navy shadow-card">
      <div className="relative min-h-[260px] sm:min-h-[280px] lg:min-h-[300px]">
        <img
          alt="مجمع سكني عصري تحيط به المساحات الخضراء"
          className="absolute inset-0 size-full object-cover object-center"
          fetchPriority="high"
          src="/images/dashboard-property.webp"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(23_34_53_/_0.08),rgb(7_94_87_/_0.22)_48%,rgb(23_34_53_/_0.82))]" />
        <div className="relative flex min-h-[260px] flex-col justify-between gap-8 p-5 text-white sm:min-h-[280px] sm:p-7 lg:min-h-[300px] lg:max-w-[62%] lg:p-8">
          <div className="space-y-4">
            <BrandLogo
              className="w-fit rounded-xl border border-white/20 bg-navy/35 px-3 py-2 backdrop-blur-md"
              tone="inverse"
              variant="compact"
            />
            <div className="space-y-2">
              <p className="text-xs font-semibold text-white/75">لوحة القيادة</p>
              <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">مرحباً بعودتك، {firstName}</h1>
              <p className="max-w-lg text-sm leading-7 text-white/82 sm:text-base">
                إليك نظرة سريعة على أداء محفظتك العقارية اليوم.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/25 bg-white/92 px-3.5 text-xs font-semibold text-navy shadow-sm backdrop-blur">
              <CalendarDays aria-hidden="true" className="size-3.5 text-primary" />
              <span>{periodLabel}</span>
            </div>
            <Can permission="reports.export">
              <Button asChild size="sm" variant="secondary">
                <Link to="/reports">
                  <Download aria-hidden="true" className="size-3.5" />
                  تصدير تقرير
                </Link>
              </Button>
            </Can>
            <Can permission="contracts.create">
              <Button asChild size="sm" variant="secondary">
                <Link to="/contracts/new">
                  <FilePlus2 aria-hidden="true" className="size-3.5" />
                  إنشاء عقد
                </Link>
              </Button>
            </Can>
            <Can permission="properties.create">
              <Button asChild size="sm">
                <Link to="/properties/new">
                  <Building2 aria-hidden="true" className="size-3.5" />
                  إضافة عقار
                </Link>
              </Button>
            </Can>
          </div>
        </div>
      </div>
    </header>
  );
}
