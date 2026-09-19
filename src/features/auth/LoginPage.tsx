import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, CheckCircle2, Eye, EyeOff, FileText, Lock, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/forms/FormField";
import { Input } from "@/components/ui/Input";
import { normalizeApiError } from "@/api/errors";
import { useAuth } from "@/features/auth/useAuth";

const loginSchema = z.object({
  email: z.string().email("أدخل بريد إلكتروني صالح."),
  password: z.string().min(1, "كلمة المرور مطلوبة."),
});

const benefits = [
  { label: "إدارة العقارات والوحدات", icon: Building2 },
  { label: "متابعة العقود والتحصيل", icon: FileText },
  { label: "تقارير وصلاحيات متقدمة", icon: ShieldCheck },
] as const;

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [imageAvailable, setImageAvailable] = useState(true);
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
    <main className="min-h-dvh overflow-hidden bg-background text-foreground" dir="rtl">
      <div className="grid min-h-dvh grid-cols-1 bg-[radial-gradient(circle_at_12%_10%,hsl(var(--primary)/0.11),transparent_22rem),linear-gradient(135deg,hsl(var(--background)),#fff_46%,hsl(var(--primary-soft)/0.55))] p-4 sm:p-6 lg:grid-cols-[55fr_45fr] lg:gap-0 lg:p-7">
        <section className="relative order-1 min-h-[300px] overflow-hidden rounded-[24px] border border-white/70 bg-navy shadow-popover lg:col-start-1 lg:min-h-0">
          {imageAvailable ? (
            <img
              alt="مبنى سكني عصري فاخر"
              className="absolute inset-0 size-full object-cover"
              src="/images/auth-property.webp"
              onError={() => setImageAvailable(false)}
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--primary-dark)),hsl(var(--navy)))]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(7_94_87_/_0.18),rgb(23_34_53_/_0.54)),linear-gradient(0deg,rgb(23_34_53_/_0.44),transparent_54%)]" />
          <div className="relative flex h-full min-h-[300px] flex-col justify-between p-5 text-white sm:p-7 lg:min-h-[calc(100dvh-3.5rem)] lg:p-9">
            <BrandLockup className="[&_p]:text-white [&_p:last-child]:text-white/75" />
            <div className="max-w-xl space-y-5">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-white/80">Real Estate Platform</p>
                <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">إدارة عقارات أكثر ذكاءً</h1>
                <p className="max-w-lg text-sm leading-7 text-white/82 sm:text-base">
                  منصة متكاملة لإدارة العقارات والوحدات والعقود والمدفوعات والصيانة من مكان واحد.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {benefits.map((benefit) => (
                  <div key={benefit.label} className="flex items-center gap-2 rounded-xl border border-white/18 bg-white/12 px-3 py-2.5 backdrop-blur-md">
                    <benefit.icon aria-hidden="true" className="size-4 shrink-0 text-white" />
                    <span className="text-xs font-semibold leading-5 text-white/90">{benefit.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="order-2 flex items-center justify-center px-1 py-7 sm:px-4 lg:col-start-2 lg:row-start-1 lg:px-8 lg:py-0 xl:px-12">
          <div className="w-full max-w-[440px]">
            <div className="mb-8 hidden lg:block">
              <BrandLockup />
            </div>
            <div className="rounded-[22px] border border-border bg-card/96 p-5 shadow-card sm:p-7">
              <div className="mb-7 space-y-2">
                <p className="text-sm font-semibold text-primary">تسجيل الدخول</p>
                <h2 className="text-2xl font-bold leading-tight text-navy">مرحباً بعودتك</h2>
                <p className="text-sm leading-6 text-muted-foreground">أدخل بيانات حسابك للوصول إلى لوحة الإدارة</p>
              </div>
              <form className="space-y-5" onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}>
                <FormField htmlFor="login-email" label="البريد الإلكتروني" error={form.formState.errors.email?.message}>
                  <div className="relative">
                    <Mail aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      autoComplete="email"
                      className="min-h-12 rounded-xl pe-4 ps-4 pr-10"
                      id="login-email"
                      inputMode="email"
                      type="email"
                      {...form.register("email")}
                    />
                  </div>
                </FormField>
                <FormField htmlFor="login-password" label="كلمة المرور" error={form.formState.errors.password?.message}>
                  <div className="relative">
                    <Lock aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      autoComplete="current-password"
                      className="min-h-12 rounded-xl pe-12 ps-12 pr-10"
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      {...form.register("password")}
                    />
                    <button
                      aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                      className="absolute left-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
                    </button>
                  </div>
                </FormField>
                {form.formState.errors.root?.message ? (
                  <p className="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive" role="alert">
                    {form.formState.errors.root.message}
                  </p>
                ) : null}
                <Button className="min-h-12 w-full rounded-xl text-base" isLoading={form.formState.isSubmitting} type="submit">
                  تسجيل الدخول
                </Button>
                <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                  <CheckCircle2 aria-hidden="true" className="size-3.5 text-primary" />
                  دخول آمن إلى بيئة الإدارة العقارية
                </p>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
