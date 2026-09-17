import type { PropsWithChildren, ReactNode } from "react";
import { useAuthorization } from "@/features/auth/useAuthorization";

type CanProps = PropsWithChildren<{
  permission: string;
  fallback?: ReactNode;
}>;

export function Can({ permission, fallback = null, children }: CanProps) {
  const { can } = useAuthorization();
  return can(permission) ? <>{children}</> : <>{fallback}</>;
}
