import { motion } from "framer-motion";
import { Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { normalizeApiError } from "@/api/errors";
import { Can } from "@/app/guards/Can";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuthorization } from "@/features/auth/useAuthorization";
import { RoleFormDialog } from "@/features/roles/RoleFormDialog";
import { useManagedRolesList, usePermissionsCatalog, useRoleMutations } from "@/features/roles/useRoles";
import { pageMotion } from "@/lib/motion";
import type { RoleCreatePayload, RoleDetail, RoleUpdatePayload } from "@/types/rbac";

export function RolesPage() {
  const { can } = useAuthorization();
  const rolesQuery = useManagedRolesList();
  const permissionsQuery = usePermissionsCatalog();
  const { createMutation, updateMutation, deleteMutation } = useRoleMutations();
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | null>(null);
  const [activeRole, setActiveRole] = useState<RoleDetail | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoleDetail | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function openCreate() {
    setActiveRole(null);
    setFormError(null);
    setDialogMode("create");
  }

  function openRole(role: RoleDetail, mode: "edit" | "view") {
    setActiveRole(role);
    setFormError(null);
    setDialogMode(mode);
  }

  async function submitRole(payload: RoleCreatePayload | RoleUpdatePayload) {
    setFormError(null);
    try {
      if (dialogMode === "create") {
        await createMutation.mutateAsync(payload as RoleCreatePayload);
      } else if (dialogMode === "edit" && activeRole) {
        await updateMutation.mutateAsync({ id: activeRole.id, payload });
      }
      setDialogMode(null);
      setActiveRole(null);
    } catch (error) {
      setFormError(normalizeApiError(error).message);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      setDeleteError(normalizeApiError(error).message);
    }
  }

  const columns: Array<DataTableColumn<RoleDetail>> = [
    {
      id: "name",
      header: "اسم الدور",
      cell: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <ShieldCheck aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{row.name}</p>
            <p className="text-meta">{row.description || "بدون وصف"}</p>
          </div>
        </div>
      ),
    },
    { id: "users", header: "عدد المستخدمين", numeric: true, cell: (row) => row.users_count },
    { id: "permissions", header: "عدد الصلاحيات", numeric: true, cell: (row) => row.permissions.length },
    {
      id: "status",
      header: "الحالة",
      cell: (row) => (row.is_system ? <Badge variant="warning">دور نظام</Badge> : <Badge variant="default">مخصص</Badge>),
    },
  ];

  function roleActions(row: RoleDetail) {
    return (
      <>
        <Can permission="roles.view">
          <Button className="rounded-full" size="sm" variant="ghost" onClick={() => openRole(row, "view")}>
            عرض
          </Button>
        </Can>
        <Can permission="roles.update">
          <Button className="rounded-full" size="sm" variant="outline" onClick={() => openRole(row, "edit")}>
            تعديل
          </Button>
        </Can>
        <Can permission="roles.delete">
          {row.is_system ? null : (
            <ActionMenu items={[{ id: "delete", label: "حذف", destructive: true, onSelect: () => setDeleteTarget(row) }]} />
          )}
        </Can>
      </>
    );
  }

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <PageHeader
          actions={
            <Can permission="roles.create">
              <Button className="rounded-full shadow-sm" onClick={openCreate}>
                <Plus aria-hidden="true" className="size-4" />
                إضافة دور
              </Button>
            </Can>
          }
          description={`إدارة أدوار المستخدمين وتحديد صلاحيات الوصول إلى النظام${permissionsQuery.data ? ` · ${permissionsQuery.data.length} صلاحية` : ""}`}
          eyebrow="المستخدمون والصلاحيات"
          title="الأدوار والصلاحيات"
        />
        {rolesQuery.isError ? (
          <ErrorState title="تعذر تحميل الأدوار" description="تعذر تحميل قائمة الأدوار والصلاحيات." onRetry={() => void rolesQuery.refetch()} />
        ) : (
          <>
            <div className="hidden md:block">
              <DataTable
                actions={roleActions}
                columns={columns}
                data={rolesQuery.data ?? []}
                emptyAction={
                  can("roles.create") ? (
                    <Button size="sm" onClick={openCreate}>
                      إضافة دور
                    </Button>
                  ) : undefined
                }
                emptyDescription="لا توجد أدوار معرفة في النظام."
                emptyTitle="لا توجد أدوار"
                getRowId={(row) => row.id}
                loading={rolesQuery.isPending}
              />
            </div>
            <div className="grid gap-2 md:hidden">
              {rolesQuery.isPending ? (
                <p className="rounded-lg border border-border bg-card px-4 py-5 text-sm text-muted-foreground">جاري تحميل الأدوار...</p>
              ) : (rolesQuery.data ?? []).length === 0 ? (
                <EmptyState
                  compact
                  action={
                    can("roles.create") ? (
                      <Button size="sm" onClick={openCreate}>
                        إضافة دور
                      </Button>
                    ) : undefined
                  }
                  description="لا توجد أدوار معرفة في النظام."
                  title="لا توجد أدوار"
                />
              ) : null}
              {(rolesQuery.data ?? []).map((role) => (
                <div key={role.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{role.name}</p>
                      <p className="mt-1 text-meta">{role.description || "بدون وصف"}</p>
                    </div>
                    {role.is_system ? <Badge variant="warning">دور نظام</Badge> : <Badge variant="default">مخصص</Badge>}
                  </div>
                  <p className="mt-3 text-meta">
                    {role.users_count} مستخدم · {role.permissions.length} صلاحية
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">{roleActions(role)}</div>
                </div>
              ))}
            </div>
          </>
        )}
        <RoleFormDialog
          error={formError}
          isLoading={createMutation.isPending || updateMutation.isPending}
          mode={dialogMode === "edit" ? "edit" : dialogMode === "view" ? "view" : "create"}
          open={dialogMode !== null}
          role={activeRole}
          onOpenChange={(open) => {
            if (!open) {
              setDialogMode(null);
              setActiveRole(null);
              setFormError(null);
            }
          }}
          onSubmit={dialogMode === "view" ? undefined : submitRole}
        />
        <ConfirmDialog
          confirmLabel="حذف الدور"
          description={deleteError ?? `هل أنت متأكد من حذف الدور «${deleteTarget?.name ?? ""}»؟`}
          isLoading={deleteMutation.isPending}
          open={deleteTarget !== null}
          title="حذف الدور"
          onConfirm={() => void confirmDelete()}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteTarget(null);
              setDeleteError(null);
            }
          }}
        />
      </PageContainer>
    </motion.div>
  );
}
