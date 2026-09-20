import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ReportDetails } from "@/features/reports/ReportDetails";
import { ReportsLanding } from "@/features/reports/ReportsLanding";
import { isReportKind } from "@/features/reports/reportConfig";
import { pageMotion } from "@/lib/motion";

export function ReportsPage() {
  const { kind } = useParams();

  return (
    <motion.div {...pageMotion}>
      {kind === undefined ? (
        <ReportsLanding />
      ) : isReportKind(kind) ? (
        <ReportDetails kind={kind} />
      ) : (
        <ErrorState
          title="التقرير غير موجود"
          description="نوع التقرير المطلوب غير متاح ضمن التقارير الحالية."
        />
      )}
    </motion.div>
  );
}
