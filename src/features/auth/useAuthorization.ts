import { useMemo } from "react";
import { useAuth } from "@/features/auth/useAuth";
import { can as canPermission, hasAnyPermission, hasPermission, isSuperuser } from "@/lib/rbac";

export function useAuthorization() {
  const { user } = useAuth();

  return useMemo(
    () => ({
      user,
      isSuperuser: isSuperuser(user),
      permissions: user?.permissions ?? [],
      can: (code: string) => canPermission(user, code),
      hasPermission: (code: string) => hasPermission(user, code),
      hasAnyPermission: (codes: string[]) => hasAnyPermission(user, codes),
    }),
    [user],
  );
}
