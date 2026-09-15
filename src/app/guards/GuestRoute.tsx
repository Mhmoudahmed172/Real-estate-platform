import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useAuth } from "@/features/auth/useAuth";

export function GuestRoute({ children }: PropsWithChildren) {
  const location = useLocation();
  const { status } = useAuth();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/dashboard";

  if (status === "bootstrapping") {
    return <LoadingState label="جاري تجهيز الجلسة..." fullScreen />;
  }

  if (status === "authenticated") {
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
