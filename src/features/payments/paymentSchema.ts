import { z } from "zod";

const optionalMoney = z.preprocess((value) => (value === "" || value == null ? undefined : value), z.coerce.number().min(0).optional());
const optionalText = z.preprocess((value) => (value === "" ? null : value), z.string().min(1).max(100).nullable().optional());

export const paymentRecordSchema = z.object({
  amount_paid: z.coerce.number({ message: "المبلغ المدفوع مطلوب" }).positive("المبلغ يجب أن يكون أكبر من صفر"),
  paid_date: z.preprocess((value) => (value === "" ? null : value), z.string().nullable().optional()),
  discount: optionalMoney,
  penalty: optionalMoney,
  receipt_number: optionalText,
});

export const paymentAdjustmentSchema = z.object({
  discount: optionalMoney.default(0),
  penalty: optionalMoney.default(0),
  reason: z.string().min(1, "سبب التسوية مطلوب").max(2000, "سبب التسوية طويل جدًا"),
});

export type PaymentRecordValues = z.infer<typeof paymentRecordSchema>;
export type PaymentAdjustmentValues = z.infer<typeof paymentAdjustmentSchema>;
