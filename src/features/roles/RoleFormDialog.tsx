import { useEffect, useState } from "react";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { RolePermissionFields } from "@/features/roles/RolePermissionFields";
import { allPermissionCodes } from "@/features/roles/permissionCatalog";
import type { RoleCreatePayload, RoleDetail, RoleUpdatePayload } from "@/types/rbac";

type RoleFormDialogProps = {
  open: boolean;
  mode: "create" | "edit" | "view";
  role?: RoleDetail | null;
  isLoading?: boolean;
  error?: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (payload: RoleCreatePayload | RoleUpdatePayload) => Promise<void>;
};

export function RoleFormDialog({ open, mode, role, isLoading = false, error, onOpenChange, onSubmit }: RoleFormDialogProps) {
  const readOnly = mode === "view";
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(role?.name ?? "");
    setDescription(role?.description ?? "");
    setPermissions(role?.permissions?.filter((code) => allPermissionCodes().includes(code)) ?? []);
    setNameError(null);
  }, [open, role]);

  async function handleSubmit() {
    if (readOnly || !onSubmit) {
      onOpenChange(false);
      return;
    }
    if (!name.trim()) {
      setNameError("أدخل اسم الدور");
      return;
    }
    await onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      permissions,
    });
  }

  const titles = {
    create: "إضافة دور",
    edit: "تعديل الدور",
    view: "عرض الدور",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titles[mode]}</DialogTitle>
          <DialogDescription>
            {mode === "view" ? "صلاحيات الدور الحالية دون تعديل." : "حدد اسم الدور ومجموعات الصلاحيات المسموح بها."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField error={nameError ?? undefined} htmlFor="role-name" label="اسم الدور" required>
              <Input id="role-name" disabled={readOnly || role?.is_system} value={name} onChange={(event) => setName(event.target.value)} />
            </FormField>
            <FormField htmlFor="role-description" label="الوصف">
              <Textarea id="role-description" disabled={readOnly} rows={2} value={description} onChange={(event) => setDescription(event.target.value)} />
            </FormField>
          </div>
          <RolePermissionFields disabled={readOnly} selected={permissions} onChange={setPermissions} />
          {error ? <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p> : null}
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button className="rounded-full" type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {readOnly ? "إغلاق" : "إلغاء"}
            </Button>
            {readOnly ? null : (
              <Button className="rounded-full px-6" isLoading={isLoading} type="button" onClick={() => void handleSubmit()}>
                {mode === "create" ? "حفظ الدور" : "حفظ التعديلات"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
