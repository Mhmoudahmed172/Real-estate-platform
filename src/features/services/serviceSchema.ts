import { z } from "zod";

const nullableVendor = z.preprocess((value) => (value === "" || value == null || value === 0 ? null : value), z.coerce.number().int().positive().nullable().optional());
const optionalCost = z.preprocess((value) => (value === "" || value == null ? null : value), z.coerce.number().min(0).nullable().optional());
const optionalDate = z.preprocess((value) => (value === "" ? null : value), z.string().nullable().optional());

export const serviceCreateSchema = z.object({
  property_id: z.coerce.number({ message: "العقار مطلوب" }).int().positive("العقار مطلوب"),
  service_name: z.string().min(1, "اسم الخدمة مطلوب"),
  provider_id: nullableVendor,
  cost: optionalCost,
  due_date: optionalDate,
});

export const serviceUpdateSchema = z.object({
  service_name: z.string().min(1, "اسم الخدمة مطلوب").nullable().optional(),
  provider_id: nullableVendor,
  cost: optionalCost,
  due_date: optionalDate,
});

export type ServiceCreateValues = z.infer<typeof serviceCreateSchema>;
export type ServiceUpdateValues = z.infer<typeof serviceUpdateSchema>;
