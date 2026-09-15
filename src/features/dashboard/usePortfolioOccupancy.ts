import { useInventorySnapshot } from "@/features/dashboard/useInventorySnapshot";

export function usePortfolioOccupancy() {
  const { unitsQuery } = useInventorySnapshot();
  const units = unitsQuery.data ?? [];
  if (units.length === 0) return null;
  const rented = units.filter((unit) => unit.status === "Rented").length;
  return (rented / units.length) * 100;
}
