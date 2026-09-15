import { z } from "zod";
import { maintenancePriorities, maintenanceStatuses } from "@/types/resources";

const nullableNumber = z.preprocess((value) => (value === "" || value == null || value === 0 ? null : value), z.coerce.number().int().positive().nullable().optional());
const optionalText = z.preprocess((value) => (value === "" ? null : value), z.string().nullable().optional());
const optionalCost = z.preprocess((value) => (value === "" || value == null ? null : value), z.coerce.number().min(0).nullable().optional());
const optionalDate = z.preprocess((value) => (value === "" ? null : value), z.string().nullable().optional());

export const maintenanceCreateSchema = z.object({
  property_id: nullableNumber,
  unit_id: nullableNumber,
  issue_type: z.string().min(1, "نوع البلاغ مطلوب"),
  priority: z.enum(maintenancePriorities).default("Medium"),
  description: optionalText,
  vendor_id: nullableNumber,
});

export const maintenanceUpdateSchema = z.object({
  priority: z.enum(maintenancePriorities).nullable().optional(),
  description: optionalText,
  vendor_id: nullableNumber,
  status: z.enum(maintenanceStatuses).nullable().optional(),
  cost: optionalCost,
  execution_date: optionalDate,
});

export const maintenanceTransitionSchema = z.object({
  status: z.enum(maintenanceStatuses),
  note: z.string().max(2000, "الملاحظة طويلة جدًا").optional().default(""),
  cost: optionalCost,
  execution_date: optionalDate,
});

export const maintenanceAssignSchema = z.object({
  vendor_id: z.coerce.number({ message: "المورد مطلوب" }).int().positive("المورد مطلوب"),
});

export type MaintenanceCreateValues = z.infer<typeof maintenanceCreateSchema>;
export type MaintenanceUpdateValues = z.infer<typeof maintenanceUpdateSchema>;
export type MaintenanceTransitionValues = z.infer<typeof maintenanceTransitionSchema>;
export type MaintenanceAssignValues = z.infer<typeof maintenanceAssignSchema>;
