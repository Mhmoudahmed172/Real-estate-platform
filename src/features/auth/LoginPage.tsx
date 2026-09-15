import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FormField } from "@/components/forms/FormField";
import { Input } from "@/components/ui/Input";
import { normalizeApiError } from "@/api/errors";
import { useAuth } from "@/features/auth/useAuth";

const loginSchema = z.object({
  email: z.string().email("أدخل بريد إلكتروني صالح."),
  password: z.string().min(1, "كلمة المرور مطلوبة."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      await login(values);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const apiError = normalizeApiError(error);
      form.setError("root", {
        message: apiError.kind === "unauthorized" ? "البريد الإلكتروني أو كلمة المرور غير صحيحة." : apiError.message,
      });
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Building2 aria-hidden="true" className="size-7" />
          </div>
          <CardTitle>Apex Realty OS</CardTitle>
          <p className="text-sm text-muted-foreground">تسجيل الدخول إلى نظام إدارة العقارات</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}>
            <FormField htmlFor="login-email" label="البريد الإلكتروني" error={form.formState.errors.email?.message}>
              <Input autoComplete="email" id="login-email" inputMode="email" type="email" {...form.register("email")} />
            </FormField>
            <FormField htmlFor="login-password" label="كلمة المرور" error={form.formState.errors.password?.message}>
              <Input autoComplete="current-password" id="login-password" type="password" {...form.register("password")} />
            </FormField>
            {form.formState.errors.root?.message ? (
              <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            ) : null}
            <Button className="w-full" isLoading={form.formState.isSubmitting} type="submit">
              دخول
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
