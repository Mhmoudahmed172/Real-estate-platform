import { currentYearRangeLabel, formatMonthYear, parseMoney } from "@/lib/format";
import { propertyTypeLabels } from "@/lib/labels";
import type {
  ContractOut,
  MaintenanceOut,
  PaymentOut,
  PropertyOut,
  PropertyType,
  TenantOut,
  UnitOut,
} from "@/types/resources";

export type DashboardKpi = {
  id: string;
  label: string;
  value: number | null;
  format: "number" | "percent" | "currency";
  mapped: boolean;
  footer: Array<{
    label: string;
    tone: "muted" | "success" | "danger" | "warning";
  }>;
};

export type PortfolioSegment = {
  type: PropertyType;
  label: string;
  propertyCount: number;
  unitsCount: number;
  occupiedUnits: number;
  occupancy: number | null;
};

export type CollectionPoint = {
  month: string;
  collected: number;
};

export type DashboardViewModel = {
  periodLabel: string;
  snapshotTruncated: boolean;
  kpis: DashboardKpi[];
  occupancyPercent: number | null;
  collections: CollectionPoint[];
  collectionsMapped: boolean;
  portfolio: PortfolioSegment[];
  featuredProperty: PropertyOut | null;
  expiringContracts: Array<{
    contract: ContractOut;
    tenantName: string;
    propertyName: string;
    unitLabel: string;
  }>;
  openMaintenance: Array<{
    request: MaintenanceOut;
    propertyName: string;
  }>;
};

const OPEN_MAINTENANCE_STATUSES = new Set(["New", "InProgress"]);

function occupancyFromUnits(units: UnitOut[]) {
  if (units.length === 0) return null;
  const rented = units.filter((unit) => unit.status === "Rented").length;
  return (rented / units.length) * 100;
}

export function buildDashboardViewModel(input: {
  properties: PropertyOut[];
  units: UnitOut[];
  expiringContracts: ContractOut[];
  maintenance: MaintenanceOut[];
  payments: PaymentOut[];
  tenants: TenantOut[];
}): DashboardViewModel {
  const year = new Date().getFullYear();
  const rentedUnits = input.units.filter((unit) => unit.status === "Rented").length;
  const vacantUnits = input.units.filter((unit) => unit.status === "Available").length;
  const reservedUnits = input.units.filter((unit) => unit.status === "Reserved").length;
  const occupancyPercent = occupancyFromUnits(input.units);

  const ytdPayments = input.payments.filter((payment) => {
    if (!payment.paid_date) return false;
    return payment.paid_date.startsWith(String(year));
  });
  const collectedYtd = ytdPayments.reduce((sum, payment) => sum + (parseMoney(payment.amount_paid) ?? 0), 0);
  const overdueCount = input.payments.filter((payment) => payment.status === "Overdue").length;
  const collectionsMapped = input.payments.some((payment) => Boolean(payment.paid_date) || payment.status === "Paid");

  const collections = Array.from({ length: 12 }, (_, monthIndex) => {
    const prefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
    const collected = input.payments.reduce((sum, payment) => {
      if (!payment.paid_date?.startsWith(prefix)) return sum;
      return sum + (parseMoney(payment.amount_paid) ?? 0);
    }, 0);
    return {
      month: formatMonthYear(year, monthIndex),
      collected,
    };
  });

  const unitsByProperty = input.units.reduce<Record<number, UnitOut[]>>((acc, unit) => {
    acc[unit.property_id] ??= [];
    acc[unit.property_id].push(unit);
    return acc;
  }, {});

  const portfolioMap = new Map<PropertyType, PortfolioSegment>();
  for (const property of input.properties) {
    const current = portfolioMap.get(property.property_type) ?? {
      type: property.property_type,
      label: propertyTypeLabels[property.property_type],
      propertyCount: 0,
      unitsCount: 0,
      occupiedUnits: 0,
      occupancy: null,
    };
    const propertyUnits = unitsByProperty[property.id] ?? [];
    current.propertyCount += 1;
    current.unitsCount += property.units_count;
    current.occupiedUnits += propertyUnits.filter((unit) => unit.status === "Rented").length;
    portfolioMap.set(property.property_type, current);
  }

  const portfolio = Array.from(portfolioMap.values())
    .map((segment) => ({
      ...segment,
      occupancy: segment.unitsCount > 0 ? (segment.occupiedUnits / segment.unitsCount) * 100 : null,
    }))
    .sort((a, b) => b.unitsCount - a.unitsCount);

  const featuredProperty = [...input.properties].sort((a, b) => b.units_count - a.units_count)[0] ?? null;
  const tenantsById = new Map(input.tenants.map((tenant) => [tenant.id, tenant.full_name]));
  const propertiesById = new Map(input.properties.map((property) => [property.id, property.name]));
  const unitsById = new Map(input.units.map((unit) => [unit.id, unit.unit_number]));

  return {
    periodLabel: currentYearRangeLabel(year),
    snapshotTruncated:
      input.properties.length >= 500 || input.units.length >= 500 || input.payments.length >= 500,
    occupancyPercent,
    collections,
    collectionsMapped,
    portfolio,
    featuredProperty,
    kpis: [
      {
        id: "properties",
        label: "إجمالي العقارات",
        value: input.properties.length,
        format: "number",
        mapped: true,
        footer: [
          { label: `${vacantUnits} وحدة شاغرة`, tone: vacantUnits > 0 ? "warning" : "muted" },
          { label: `${input.units.length} وحدة محملة`, tone: "muted" },
        ],
      },
      {
        id: "occupancy",
        label: "معدل الإشغال",
        value: occupancyPercent,
        format: "percent",
        mapped: occupancyPercent !== null,
        footer: [
          { label: `${rentedUnits} مؤجرة`, tone: "success" },
          { label: `${reservedUnits} محجوزة`, tone: "muted" },
        ],
      },
      {
        id: "rented-units",
        label: "وحدات مؤجرة",
        value: rentedUnits,
        format: "number",
        mapped: true,
        footer: [
          { label: occupancyPercent === null ? "لا تتوفر وحدات" : `${Math.round(occupancyPercent)}% من المحمّل`, tone: "success" },
        ],
      },
      {
        id: "collected",
        label: "الإيرادات المحصلة",
        value: collectionsMapped ? collectedYtd : null,
        format: "currency",
        mapped: collectionsMapped,
        footer: [
          { label: `${overdueCount} متأخرات`, tone: overdueCount > 0 ? "danger" : "muted" },
          { label: "من دفعات السنة الحالية", tone: "muted" },
        ],
      },
    ],
    expiringContracts: input.expiringContracts.slice(0, 4).map((contract) => ({
      contract,
      tenantName: tenantsById.get(contract.tenant_id) ?? `مستأجر #${contract.tenant_id}`,
      propertyName: propertiesById.get(contract.property_id) ?? `عقار #${contract.property_id}`,
      unitLabel: unitsById.get(contract.unit_id) ?? `وحدة #${contract.unit_id}`,
    })),
    openMaintenance: input.maintenance
      .filter((request) => OPEN_MAINTENANCE_STATUSES.has(request.status))
      .slice(0, 4)
      .map((request) => ({
        request,
        propertyName: request.property_id ? (propertiesById.get(request.property_id) ?? `عقار #${request.property_id}`) : "غير مربوط",
      })),
  };
}
