import { z } from "zod";

const optionalText = z.preprocess((value) => (value === "" ? null : value), z.string().nullable().optional());

export const vendorFormSchema = z.object({
  name: z.string().min(1, "اسم المورد مطلوب"),
  phone: optionalText,
  email: optionalText,
  services_provided: optionalText,
  notes: optionalText,
});

export type VendorFormValues = z.infer<typeof vendorFormSchema>;
