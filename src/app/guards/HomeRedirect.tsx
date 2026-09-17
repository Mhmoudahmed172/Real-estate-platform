import { Navigate } from "react-router-dom";
import { navigationItems } from "@/app/router/routes";
import { useAuth } from "@/features/auth/useAuth";
import { firstAllowedPath } from "@/lib/rbac";

export function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={firstAllowedPath(user, navigationItems)} replace />;
}
