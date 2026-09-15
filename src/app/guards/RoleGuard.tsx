import type { PropsWithChildren, ReactNode } from "react";
import { useAuth } from "@/features/auth/useAuth";
import { userHasRole } from "@/lib/rbac";

type RoleGuardProps = PropsWithChildren<{
  roles: string[];
  fallback?: ReactNode;
}>;

export function RoleGuard({ roles, fallback = null, children }: RoleGuardProps) {
  const { user } = useAuth();
  return userHasRole(user, roles) ? <>{children}</> : <>{fallback}</>;
}
