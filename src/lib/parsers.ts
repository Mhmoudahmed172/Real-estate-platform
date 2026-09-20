import { asNullableNumber, asNullableString, asNumber, asString, isOneOf, isRecord } from "@/lib/guards";
import type { PageResponse, PageSize } from "@/types/api";
import {
  contractStatuses,
  maintenancePriorities,
  maintenanceStatuses,
  paymentFrequencies,
  paymentStatuses,
  propertyStatuses,
  propertyTypes,
  unitStatuses,
  type ContractOut,
  type MaintenanceOut,
  type OwnerOut,
  type PaymentOut,
  type PropertyOut,
  type ServiceOut,
  type TenantOut,
  type UnitOut,
  type VendorOut,
} from "@/types/resources";

export function parsePage<T>(value: unknown, parseItems: (items: unknown) => T[]): PageResponse<T> {
  if (!isRecord(value)) throw new Error("تعذر قراءة بيانات الصفحة.");
  const pageSize = Number(value.page_size);
  if (![10, 20, 50].includes(pageSize)) throw new Error("حجم الصفحة غير صالح.");
  return {
    items: parseItems(value.items),
    total: Number(value.total) || 0,
    page: Number(value.page) || 1,
    page_size: pageSize as PageSize,
    total_pages: Number(value.total_pages) || 0,
  };
}

function parseArray<T>(value: unknown, parseItem: (item: unknown) => T | null): T[] {
  if (!Array.isArray(value)) return [];
  return value.map(parseItem).filter((item): item is T => item !== null);
}

export function parsePropertyOut(value: unknown): PropertyOut | null {
  if (!isRecord(value)) return null;
  const id = asNumber(value.id);
  const name = asString(value.name);
  const unitsCount = asNumber(value.units_count);
  if (id === null || !name || unitsCount === null || !isOneOf(value.property_type, propertyTypes) || !isOneOf(value.status, propertyStatuses)) return null;
  return { id, name, property_type: value.property_type, address: asNullableString(value.address) ?? null, city: asNullableString(value.city) ?? null, floors_count: asNullableNumber(value.floors_count) ?? null, owner_id: asNullableNumber(value.owner_id) ?? null, notes: asNullableString(value.notes) ?? null, status: value.status, units_count: unitsCount };
}
export function parsePropertyList(value: unknown) { return parseArray(value, parsePropertyOut); }

export function parseUnitOut(value: unknown): UnitOut | null {
  if (!isRecord(value)) return null;
  const id = asNumber(value.id); const unitNumber = asString(value.unit_number); const rentValue = asNumber(value.rent_value); const propertyId = asNumber(value.property_id);
  if (id === null || !unitNumber || rentValue === null || propertyId === null || !isOneOf(value.status, unitStatuses)) return null;
  return { id, unit_number: unitNumber, unit_type: asNullableString(value.unit_type) ?? null, area: asNullableNumber(value.area) ?? null, rooms_count: asNullableNumber(value.rooms_count) ?? null, floor: asNullableNumber(value.floor) ?? null, rent_value: rentValue, property_id: propertyId, status: value.status, vacant_since: asNullableString(value.vacant_since) ?? null };
}
export function parseUnitList(value: unknown) { return parseArray(value, parseUnitOut); }

export function parseOwnerOut(value: unknown): OwnerOut | null {
  if (!isRecord(value)) return null;
  const id = asNumber(value.id); const fullName = asString(value.full_name);
  if (id === null || !fullName) return null;
  return { id, full_name: fullName, phone: asNullableString(value.phone) ?? null, email: asNullableString(value.email) ?? null, national_id: asNullableString(value.national_id) ?? null, notes: asNullableString(value.notes) ?? null };
}
export function parseOwnerList(value: unknown) { return parseArray(value, parseOwnerOut); }
export function parseTenantOut(value: unknown): TenantOut | null { return parseOwnerOut(value); }
export function parseTenantList(value: unknown) { return parseArray(value, parseTenantOut); }

export function parseContractOut(value: unknown): ContractOut | null {
  if (!isRecord(value)) return null;
  const id = asNumber(value.id); const propertyId = asNumber(value.property_id); const unitId = asNumber(value.unit_id); const ownerId = asNumber(value.owner_id); const tenantId = asNumber(value.tenant_id); const startDate = asString(value.start_date); const endDate = asString(value.end_date); const rentValue = asString(value.rent_value);
  if (id === null || propertyId === null || unitId === null || ownerId === null || tenantId === null || !startDate || !endDate || !rentValue || !isOneOf(value.status, contractStatuses)) return null;
  return { id, property_id: propertyId, unit_id: unitId, owner_id: ownerId, tenant_id: tenantId, start_date: startDate, end_date: endDate, rent_value: rentValue, payment_frequency: isOneOf(value.payment_frequency, paymentFrequencies) ? value.payment_frequency : undefined, deposit_amount: asString(value.deposit_amount) || undefined, terms: asNullableString(value.terms) ?? null, status: value.status, renewed_from_id: asNullableNumber(value.renewed_from_id) ?? null, days_remaining: asNullableNumber(value.days_remaining) ?? null, collection_status: asNullableString(value.collection_status) ?? null, total_due: asNullableString(value.total_due) ?? null, total_paid: asNullableString(value.total_paid) ?? null, outstanding_amount: asNullableString(value.outstanding_amount) ?? null, overdue_count: asNullableNumber(value.overdue_count) ?? null };
}
export function parseContractList(value: unknown) { return parseArray(value, parseContractOut); }

export function parseMaintenanceOut(value: unknown): MaintenanceOut | null {
  if (!isRecord(value)) return null;
  const id = asNumber(value.id); const issueType = asString(value.issue_type); const cost = asNumber(value.cost);
  if (id === null || !issueType || cost === null || !isOneOf(value.status, maintenanceStatuses)) return null;
  return { id, issue_type: issueType, status: value.status, cost, property_id: asNullableNumber(value.property_id) ?? null, unit_id: asNullableNumber(value.unit_id) ?? null, priority: isOneOf(value.priority, maintenancePriorities) ? value.priority : undefined, description: asNullableString(value.description) ?? null, vendor_id: asNullableNumber(value.vendor_id) ?? null, execution_date: asNullableString(value.execution_date) ?? null, created_at: asNullableString(value.created_at) ?? null };
}
export function parseMaintenanceList(value: unknown) { return parseArray(value, parseMaintenanceOut); }

export function parseServiceOut(value: unknown): ServiceOut | null {
  if (!isRecord(value)) return null;
  const id = asNumber(value.id); const propertyId = asNumber(value.property_id); const serviceName = asString(value.service_name);
  if (id === null || propertyId === null || !serviceName) return null;
  return { id, property_id: propertyId, service_name: serviceName, provider_id: asNullableNumber(value.provider_id) ?? null, cost: asNullableNumber(value.cost) ?? null, due_date: asNullableString(value.due_date) ?? null };
}
export function parseServiceList(value: unknown) { return parseArray(value, parseServiceOut); }

export function parseVendorOut(value: unknown): VendorOut | null {
  if (!isRecord(value)) return null;
  const id = asNumber(value.id); const name = asString(value.name);
  if (id === null || !name) return null;
  return { id, name, phone: asNullableString(value.phone) ?? null, email: asNullableString(value.email) ?? null, services_provided: asNullableString(value.services_provided) ?? null, notes: asNullableString(value.notes) ?? null };
}
export function parseVendorList(value: unknown) { return parseArray(value, parseVendorOut); }

export function parsePaymentOut(value: unknown): PaymentOut | null {
  if (!isRecord(value)) return null;
  const id = asNumber(value.id); const contractId = asNumber(value.contract_id); const dueDate = asString(value.due_date); const amountDue = asString(value.amount_due); const amountPaid = asString(value.amount_paid); const discount = asString(value.discount); const penalty = asString(value.penalty);
  if (id === null || contractId === null || !dueDate || !amountDue || !amountPaid || !discount || !penalty || !isOneOf(value.status, paymentStatuses)) return null;
  return { id, contract_id: contractId, due_date: dueDate, amount_due: amountDue, amount_paid: amountPaid, status: value.status, paid_date: asNullableString(value.paid_date) ?? null, discount, penalty, receipt_number: asNullableString(value.receipt_number) ?? null };
}
export function parsePaymentList(value: unknown) { return parseArray(value, parsePaymentOut); }

export function parseOwnerSummary(value: unknown) {
  if (!isRecord(value)) return null;
  const ownerId = asNumber(value.owner_id);
  const totalProperties = asNumber(value.total_properties);
  const totalUnits = asNumber(value.total_units);
  const occupiedUnits = asNumber(value.occupied_units);
  const occupancyRate = asNumber(value.occupancy_rate);
  const expectedRent = asString(value.expected_rent);
  const collectedRent = asString(value.collected_rent);
  const outstanding = asString(value.outstanding);
  const maintenanceExpenses = asString(value.maintenance_expenses);
  if (ownerId === null || totalProperties === null || totalUnits === null || occupiedUnits === null || occupancyRate === null || !expectedRent || !collectedRent || !outstanding || !maintenanceExpenses) return null;
  return { owner_id: ownerId, total_properties: totalProperties, total_units: totalUnits, occupied_units: occupiedUnits, occupancy_rate: occupancyRate, expected_rent: expectedRent, collected_rent: collectedRent, outstanding, maintenance_expenses: maintenanceExpenses };
}

export function parseTenantSummary(value: unknown) {
  if (!isRecord(value)) return null;
  const tenantId = asNumber(value.tenant_id);
  const remainingBalance = asString(value.remaining_balance);
  const overdueCount = asNumber(value.overdue_payment_count);
  const maintenanceCount = asNumber(value.maintenance_request_count);
  if (tenantId === null || !remainingBalance || overdueCount === null || maintenanceCount === null) return null;
  const next = isRecord(value.next_payment)
    ? {
        payment_id: asNumber(value.next_payment.payment_id) ?? 0,
        contract_id: asNumber(value.next_payment.contract_id) ?? 0,
        due_date: asString(value.next_payment.due_date) ?? "",
        remaining: asString(value.next_payment.remaining) ?? "0",
      }
    : null;
  return {
    tenant_id: tenantId,
    current_unit: parseUnitOut(value.current_unit),
    active_contract: parseContractOut(value.active_contract),
    remaining_balance: remainingBalance,
    next_payment: next && next.payment_id && next.due_date ? next : null,
    overdue_payment_count: overdueCount,
    maintenance_request_count: maintenanceCount,
  };
}

export function parseUnitOperational(value: unknown) {
  if (!isRecord(value)) return null;
  const unit = parseUnitOut(value.unit);
  const lastRent = asNumber(value.last_rent_value);
  if (!unit || lastRent === null) return null;
  return {
    unit,
    current_tenant: parseOwnerOut(value.current_tenant),
    active_contract: parseContractOut(value.active_contract),
    contract_end_date: asNullableString(value.contract_end_date) ?? null,
    vacant_since: asNullableString(value.vacant_since) ?? null,
    vacancy_duration_days: asNullableNumber(value.vacancy_duration_days) ?? null,
    maintenance_status: asNullableString(value.maintenance_status) ?? null,
    last_rent_value: lastRent,
  };
}

export function parseVendorStats(value: unknown) {
  if (!isRecord(value)) return null;
  const vendorId = asNumber(value.vendor_id);
  const completed = asNumber(value.completed_request_count);
  const totalCost = asNumber(value.total_maintenance_cost);
  if (vendorId === null || completed === null || totalCost === null) return null;
  return {
    vendor_id: vendorId,
    completed_request_count: completed,
    total_maintenance_cost: totalCost,
    average_completion_hours: asNullableNumber(value.average_completion_hours) ?? null,
  };
}
