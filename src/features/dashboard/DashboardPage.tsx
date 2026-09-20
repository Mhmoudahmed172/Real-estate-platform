import { motion } from "framer-motion";
import { AlertTriangle, Building2, CircleDollarSign, ClipboardList, Hammer, Home, Percent, Wallet } from "lucide-react";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";
import { DashboardCollectionsChart } from "@/features/dashboard/DashboardCollectionsChart";
import { DashboardExpiringContracts } from "@/features/dashboard/DashboardExpiringContracts";
import { DashboardKpiCard } from "@/features/dashboard/DashboardKpiCard";
import { DashboardOpenMaintenance } from "@/features/dashboard/DashboardOpenMaintenance";
import { DashboardPortfolio } from "@/features/dashboard/DashboardPortfolio";
import { DashboardSectionSkeleton, DashboardSkeleton } from "@/features/dashboard/DashboardSkeleton";
import { DashboardWelcome } from "@/features/dashboard/DashboardWelcome";
import { useDashboardWorkspace } from "@/features/dashboard/useDashboardWorkspace";
import { pageMotion, staggerContainer } from "@/lib/motion";

const kpiIcons = {
  overdue: AlertTriangle,
  "due-this-month": Wallet,
  "vacant-over-30": Home,
  expiring: ClipboardList,
  "expected-vs-collected": CircleDollarSign,
  "net-collection": CircleDollarSign,
  "urgent-maintenance": Hammer,
  "overdue-maintenance": AlertTriangle,
  properties: Building2,
  occupancy: Percent,
  "rented-units": Home,
  collected: CircleDollarSign,
} as const;

export function DashboardPage() {
  const { isCorePending, isError, refetch, viewModel, paymentsReady, expiringReady, maintenanceReady } =
    useDashboardWorkspace();

  if (isCorePending) return <DashboardSkeleton />;
  if (isError || !viewModel) {
    return (
      <PageContainer>
        <ErrorState
          description="تعذر تحميل مؤشرات لوحة القيادة."
          title="تعذر تحميل لوحة القيادة"
          onRetry={refetch}
        />
      </PageContainer>
    );
  }

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <DashboardWelcome periodLabel={viewModel.periodLabel} />
        <motion.section className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4" {...staggerContainer}>
          {viewModel.kpis.map((kpi) => (
            <DashboardKpiCard key={kpi.id} icon={kpiIcons[kpi.id as keyof typeof kpiIcons] ?? Building2} kpi={kpi} />
          ))}
        </motion.section>
        {viewModel.secondaryKpis.length > 0 ? (
          <motion.section className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-4" {...staggerContainer}>
            {viewModel.secondaryKpis.map((kpi) => (
              <DashboardKpiCard compact key={kpi.id} icon={kpiIcons[kpi.id as keyof typeof kpiIcons] ?? Building2} kpi={kpi} />
            ))}
          </motion.section>
        ) : null}
        <section className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          {paymentsReady ? (
            <DashboardCollectionsChart
              collectedYtd={viewModel.kpis.find((kpi) => kpi.id === "due-this-month")?.value ?? viewModel.kpis.find((kpi) => kpi.id === "collected")?.value ?? null}
              mapped={viewModel.collectionsMapped}
              occupancyPercent={viewModel.occupancyPercent}
              points={viewModel.collections}
            />
          ) : (
            <DashboardSectionSkeleton chart />
          )}
          <DashboardPortfolio featuredProperty={viewModel.featuredProperty} segments={viewModel.portfolio} />
        </section>
        <section className="grid items-stretch gap-4 xl:grid-cols-2">
          {expiringReady ? (
            <DashboardExpiringContracts rows={viewModel.expiringContracts} />
          ) : (
            <DashboardSectionSkeleton />
          )}
          {maintenanceReady ? (
            <DashboardOpenMaintenance rows={viewModel.openMaintenance} />
          ) : (
            <DashboardSectionSkeleton />
          )}
        </section>
      </PageContainer>
    </motion.div>
  );
}
