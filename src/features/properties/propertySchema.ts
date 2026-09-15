import { z } from "zod";
import { propertyStatuses, propertyTypes } from "@/types/resources";

const optionalText = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  });

const optionalNumber = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}, z.number().int().positive().nullable());

export const propertyFormSchema = z.object({
  name: z.string().trim().min(1, "اسم العقار مطلوب."),
  property_type: z.enum(propertyTypes, { required_error: "نوع العقار مطلوب." }),
  address: optionalText,
  city: optionalText,
  floors_count: optionalNumber,
  owner_id: optionalNumber,
  notes: optionalText,
  status: z.enum(propertyStatuses).optional().nullable(),
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;
