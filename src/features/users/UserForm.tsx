import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { FormField } from "@/components/forms/FormField";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { userFormSchema, type UserFormValues } from "@/features/users/userSchema";
import { applyApiFieldErrors } from "@/lib/formErrors";
import type { Role, User, UserCreate, UserUpdate } from "@/types/auth";

type UserFormProps = {
  mode: "create" | "edit";
  user?: User;
  roles: Role[];
  rolesLoading?: boolean;
  onSubmit: (payload: UserCreate | UserUpdate) => Promise<void>;
  onCancelHref: string;
};

function defaults(mode: "create" | "edit", user?: User): UserFormValues {
  return {
    email: mode === "create" ? "" : (user?.email ?? ""),
    full_name: user?.full_name ?? "",
    password: "",
    role_id: user?.role?.id ?? 0,
    is_active: user?.is_active ?? true,
  };
}

export function UserForm({ mode, user, roles, rolesLoading = false, onSubmit, onCancelHref }: UserFormProps) {
  const isCreate = mode === "create";
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema(mode)),
    defaultValues: defaults(mode, user),
  });

  async function handleSubmit(values: UserFormValues) {
    try {
      if (isCreate) {
        await onSubmit({
          email: values.email,
          full_name: values.full_name.trim() || null,
          password: values.password,
          role_id: values.role_id,
        });
        return;
      }

      await onSubmit({
        full_name: values.full_name.trim() || null,
        is_active: values.is_active,
        role_id: values.role_id,
        password: values.password.trim() ? values.password : null,
      });
    } catch (error) {
      const apiError = applyApiFieldErrors(error, form.setError);
      form.setError("root", { message: apiError.message });
    }
  }

  return (
    <form className="space-y-5" onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}>
      <FormSection title="بيانات المستخدم" description="الحقول المطابقة لمخطط UserCreate و UserUpdate في OpenAPI.">
        <div className="grid gap-4 md:grid-cols-2">
          {isCreate ? (
            <FormField error={form.formState.errors.email?.message} htmlFor="user-email" label="البريد الإلكتروني" required>
              <Input id="user-email" type="email" {...form.register("email")} />
            </FormField>
          ) : null}
          <FormField error={form.formState.errors.full_name?.message} htmlFor="user-full-name" label="الاسم الكامل">
            <Input id="user-full-name" {...form.register("full_name")} />
          </FormField>
          <FormField error={form.formState.errors.role_id?.message} htmlFor="user-role" label="تعيين الدور" required>
            <Select
              disabled={rolesLoading || roles.length === 0}
              value={String(form.watch("role_id") || "")}
              onValueChange={(value) => form.setValue("role_id", Number(value), { shouldDirty: true, shouldValidate: true })}
            >
              <SelectTrigger id="user-role" className="rounded-xl">
                <SelectValue placeholder={rolesLoading ? "جاري تحميل الأدوار" : "اختر الدور"} />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={String(role.id)}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          {!isCreate ? (
            <FormField error={form.formState.errors.is_active?.message} htmlFor="user-active" label="الحالة">
              <Select
                value={form.watch("is_active") ? "active" : "inactive"}
                onValueChange={(value) => form.setValue("is_active", value === "active", { shouldDirty: true, shouldValidate: true })}
              >
                <SelectTrigger id="user-active" className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">معطل</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          ) : null}
          <FormField error={form.formState.errors.password?.message} htmlFor="user-password" label={isCreate ? "كلمة المرور" : "كلمة مرور جديدة"} required={isCreate}>
            <Input id="user-password" type="password" autoComplete="new-password" {...form.register("password")} />
          </FormField>
        </div>
      </FormSection>
      {form.formState.errors.root?.message ? <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">{form.formState.errors.root.message}</p> : null}
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-5">
        <Button asChild className="rounded-full" type="button" variant="outline">
          <Link to={onCancelHref}>إلغاء</Link>
        </Button>
        <Button className="rounded-full px-6" disabled={roles.length === 0} isLoading={form.formState.isSubmitting} type="submit">
          {isCreate ? "حفظ المستخدم" : "حفظ التعديلات"}
        </Button>
      </div>
    </form>
  );
}
