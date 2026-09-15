import { z } from "zod";

const optionalText = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  });

const optionalEmail = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  })
  .pipe(z.string().email("صيغة البريد الإلكتروني غير صحيحة.").nullable());

export const partyFormSchema = z.object({
  full_name: z.string().trim().min(1, "الاسم مطلوب."),
  phone: optionalText,
  email: optionalEmail,
  national_id: optionalText,
  notes: optionalText,
});

export type PartyFormValues = z.infer<typeof partyFormSchema>;
