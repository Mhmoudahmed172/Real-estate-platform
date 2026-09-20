import { z } from "zod";
import { contractStatuses, paymentFrequencies } from "@/types/resources";

const requiredNumber = (label: string) => z.coerce.number({ message: `${label} مطلوب` }).int(`${label} غير صالح`).positive(`${label} غير صالح`);
const money = (label: string) => z.coerce.number({ message: `${label} مطلوب` }).positive(`${label} يجب أن يكون أكبر من صفر`);
const optionalMoney = z.preprocess((value) => (value === "" || value == null ? undefined : value), z.coerce.number().min(0).optional());
const optionalText = z.preprocess((value) => (value === "" ? null : value), z.string().nullable().optional());

export const contractFormSchema = z.object({
  property_id: requiredNumber("العقار"),
  unit_id: requiredNumber("الوحدة"),
  owner_id: z.coerce.number({ message: "المالك مطلوب" }).int().nonnegative().optional(),
  tenant_id: requiredNumber("المستأجر"),
  start_date: z.string().min(1, "تاريخ البداية مطلوب"),
  end_date: z.string().min(1, "تاريخ النهاية مطلوب"),
  rent_value: money("قيمة الإيجار"),
  payment_frequency: z.enum(paymentFrequencies),
  deposit_amount: optionalMoney.default(0),
  terms: optionalText,
});

export const contractUpdateSchema = z.object({
  end_date: z.string().min(1, "تاريخ النهاية مطلوب"),
  rent_value: money("قيمة الإيجار"),
  status: z.enum(contractStatuses),
  terms: optionalText,
});

export const renewalSchema = z.object({
  start_date: z.string().min(1, "تاريخ البداية مطلوب"),
  end_date: z.string().min(1, "تاريخ النهاية مطلوب"),
  rent_value: money("قيمة الإيجار"),
});

export type ContractFormValues = z.infer<typeof contractFormSchema>;
export type ContractUpdateValues = z.infer<typeof contractUpdateSchema>;
export type RenewalValues = z.infer<typeof renewalSchema>;
