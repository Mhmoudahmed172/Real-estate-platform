import type { DashboardKpiLink } from "@/types/operations";

const resourcePaths: Record<string, string> = {
  payments: "/payments",
  units: "/units",
  contracts: "/contracts",
  maintenance: "/maintenance",
};

export function kpiFilterHref(link?: DashboardKpiLink | null) {
  if (!link) return null;
  const path = resourcePaths[link.resource];
  if (!path) return null;
  const params = new URLSearchParams();
  Object.entries(link.query).forEach(([key, value]) => {
    params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function readSearchFlag(params: URLSearchParams, key: string) {
  const value = params.get(key);
  return value === "true" || value === "1";
}

export function readSearchNumber(params: URLSearchParams, key: string) {
  const value = params.get(key);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
