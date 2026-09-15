import type { User } from "@/types/auth";

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
