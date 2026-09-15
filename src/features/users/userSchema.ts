import { z } from "zod";

export type UserFormValues = {
  email: string;
  full_name: string;
  password: string;
  role_id: number;
  is_active: boolean;
};

export function userFormSchema(mode: "create" | "edit") {
  return z
    .object({
      email: z.string().trim(),
      full_name: z.string().trim(),
      password: z.string(),
      role_id: z.coerce.number().int("اختر دورًا صحيحًا").positive("اختر الدور"),
      is_active: z.boolean(),
    })
    .superRefine((values, ctx) => {
      if (mode === "create") {
        const email = z.string().email().safeParse(values.email);
        if (!email.success) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["email"], message: "أدخل بريدًا إلكترونيًا صحيحًا" });
        }
        if (values.password.length < 10 || values.password.length > 72) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["password"], message: "كلمة المرور يجب أن تكون بين 10 و72 حرفًا" });
        }
      }
      if (mode === "edit" && values.password && (values.password.length < 10 || values.password.length > 72)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["password"], message: "كلمة المرور يجب أن تكون بين 10 و72 حرفًا" });
      }
    });
}
