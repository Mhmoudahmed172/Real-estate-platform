import type { NavigationItem } from "@/app/router/routes";
import type { User } from "@/types/auth";

export function isSuperuser(user: User | null | undefined) {
  return Boolean(user?.is_superuser);
}

export function userPermissions(user: User | null | undefined): string[] {
  if (!user) return [];
  return user.permissions ?? [];
}

export function hasPermission(user: User | null | undefined, code: string) {
  if (!user) return false;
  if (user.is_superuser) return true;
  return userPermissions(user).includes(code);
}

export function hasAnyPermission(user: User | null | undefined, codes: string[]) {
  return codes.some((code) => hasPermission(user, code));
}

export function can(user: User | null | undefined, code: string) {
  return hasPermission(user, code);
}

export function userHasRole(user: User | null, roles: string[]) {
  if (!user) return false;
  if (user.is_superuser) return true;
  const roleName = user.role?.name;
  return Boolean(roleName && roles.includes(roleName));
}

export function getUserRoleName(user: User | null) {
  if (!user) return null;
  return user.is_superuser ? "superuser" : user.role?.name ?? null;
}

export function firstAllowedPath(user: User | null | undefined, items: NavigationItem[]) {
  const match = items.find((item) => hasPermission(user, item.permission));
  return match?.href ?? "/dashboard";
}
