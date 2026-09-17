import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingState } from "@/components/feedback/LoadingState";
import { navigationItems } from "@/app/router/routes";
import { useAuth } from "@/features/auth/useAuth";
import { firstAllowedPath } from "@/lib/rbac";

export function GuestRoute({ children }: PropsWithChildren) {
  const location = useLocation();
  const { status, user } = useAuth();
  const requested = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
  const fallback = firstAllowedPath(user, navigationItems);
  const from = requested && requested !== "/login" ? requested : fallback;

  if (status === "bootstrapping") {
    return <LoadingState label="جاري تجهيز الجلسة..." fullScreen />;
  }

  if (status === "authenticated") {
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
