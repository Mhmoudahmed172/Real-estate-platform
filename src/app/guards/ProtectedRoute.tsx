import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useAuth } from "@/features/auth/useAuth";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const location = useLocation();
  const { status } = useAuth();

  if (status === "bootstrapping") {
    return <LoadingState label="جاري تجهيز الجلسة..." fullScreen />;
  }

  if (status === "guest") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
