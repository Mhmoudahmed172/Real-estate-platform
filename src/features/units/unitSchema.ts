import { z } from "zod";
import { unitStatuses } from "@/types/resources";

const optionalText = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  });

const optionalInteger = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}, z.number().int("يجب إدخال رقم صحيح.").min(0, "يجب ألا يكون الرقم سالباً.").nullable());

const optionalNumber = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}, z.number().min(0, "يجب ألا تكون القيمة سالبة.").nullable());

const requiredPositiveNumber = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return value;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}, z.number({ required_error: "قيمة الإيجار مطلوبة.", invalid_type_error: "قيمة الإيجار مطلوبة." }).positive("قيمة الإيجار يجب أن تكون أكبر من صفر."));

const requiredPropertyId = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}, z.number({ required_error: "العقار مطلوب.", invalid_type_error: "العقار مطلوب." }).int().positive("العقار مطلوب."));

export const unitFormSchema = z.object({
  unit_number: z.string().trim().min(1, "رقم الوحدة مطلوب."),
  unit_type: optionalText,
  area: optionalNumber,
  rooms_count: optionalInteger,
  floor: optionalInteger,
  rent_value: requiredPositiveNumber,
  property_id: requiredPropertyId,
  status: z.enum(unitStatuses).optional().nullable(),
});

export type UnitFormValues = z.infer<typeof unitFormSchema>;
