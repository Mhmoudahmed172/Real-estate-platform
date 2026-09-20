import { motion } from "framer-motion";
import { Plus, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Can } from "@/app/guards/Can";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Pagination } from "@/components/tables/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuthorization } from "@/features/auth/useAuthorization";
import { useUserMutations, useUsersPage } from "@/features/users/useUsers";
import { normalizeApiError } from "@/api/errors";
import { pageMotion } from "@/lib/motion";
import { readPageParams, writePageParams } from "@/lib/pagination";
import type { User } from "@/types/auth";

function UserStatusBadge({ user }: { user: User }) {
  if (!user.is_active) return <Badge variant="muted">معطل</Badge>;
  return <Badge variant="success">نشط</Badge>;
}

function UserRoleBadge({ user }: { user: User }) {
  if (user.is_superuser) return <Badge variant="warning">Superuser</Badge>;
  return <Badge variant="default">{user.role?.name ?? "بدون دور"}</Badge>;
}

export function UsersPage() {
  const { can } = useAuthorization();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const pagination = readPageParams(searchParams);
  const usersQuery = useUsersPage(pagination);
  const pageData = usersQuery.data;
  const paginationProps = pageData ? {
    page: pageData.page,
    pageSize: pageData.page_size,
    total: pageData.total,
    totalPages: pageData.total_pages,
    onPageChange: (page: number) => setSearchParams(writePageParams(searchParams, { page })),
    onPageSizeChange: (page_size: typeof pageData.page_size) => setSearchParams(writePageParams(searchParams, { page_size })),
  } : undefined;
  const { deleteMutation } = useUserMutations();
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      if ((pageData?.items.length ?? 0) === 1 && pagination.page > 1) {
        setSearchParams(writePageParams(searchParams, { page: pagination.page - 1 }));
      }
    } catch (error) {
      setDeleteError(normalizeApiError(error).message);
    }
  }

  const columns: Array<DataTableColumn<User>> = [
    {
      id: "user",
      header: "المستخدم",
      cell: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <UserRound aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{row.full_name || row.email}</p>
            <p className="font-numeric text-meta">{row.email}</p>
          </div>
        </div>
      ),
    },
    { id: "role", header: "الدور", cell: (row) => <UserRoleBadge user={row} /> },
    { id: "status", header: "الحالة", cell: (row) => <UserStatusBadge user={row} /> },
    { id: "id", header: "المعرف", numeric: true, cell: (row) => row.id },
  ];

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <PageHeader
          actions={
            <Can permission="users.create">
              <Button asChild className="rounded-full shadow-sm">
                <Link to="/users/new">
                  <Plus aria-hidden="true" className="size-4" />
                  إضافة مستخدم
                </Link>
              </Button>
            </Can>
          }
          description="إدارة المستخدمين وتعيين الأدوار المعرفة في النظام."
          eyebrow="المستخدمون والصلاحيات"
          title="المستخدمون"
        />
        <section className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-card md:grid-cols-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <ShieldCheck aria-hidden="true" className="size-4" />
            </span>
            <div>
              <p className="text-meta">تعيين الأدوار</p>
              <p className="text-sm font-semibold text-foreground">يُختار الدور لكل مستخدم من الأدوار المعرفة في النظام</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-muted-foreground md:col-span-2">
            تظهر صلاحيات كل مستخدم حسب الدور المعيّن له. يمكن إدارة الأدوار والصلاحيات من صفحة الأدوار.
            {can("roles.view") ? (
              <>
                {" "}
                <Link className="font-medium text-primary underline-offset-4 hover:underline" to="/roles">
                  فتح الأدوار والصلاحيات
                </Link>
              </>
            ) : null}
          </p>
        </section>
        {usersQuery.isError ? (
          <ErrorState title="تعذر تحميل المستخدمين" description="تعذر تحميل قائمة المستخدمين." onRetry={() => void usersQuery.refetch()} />
        ) : (
          <>
            <div className="hidden md:block">
              <DataTable
                actions={(row) => (
                  <>
                    <Can permission="users.update">
                      <Button asChild className="rounded-full" size="sm" variant="outline">
                        <Link to={`/users/${row.id}/edit`}>تعديل</Link>
                      </Button>
                    </Can>
                    <Can permission="users.delete">
                      <Button className="rounded-full" size="sm" variant="destructive" onClick={() => setDeleteTarget(row)}>
                        حذف
                      </Button>
                    </Can>
                  </>
                )}
                columns={columns}
                data={pageData?.items ?? []}
                emptyAction={can("users.create") ? <Button asChild size="sm"><Link to="/users/new">إضافة مستخدم</Link></Button> : undefined}
                emptyDescription="لا توجد حسابات مستخدمين في الصفحة الحالية."
                emptyTitle="لا يوجد مستخدمون"
                getRowId={(row) => row.id}
                loading={usersQuery.isPending}
                pagination={paginationProps}
                updating={usersQuery.isFetching && !usersQuery.isPending}
                onRowClick={can("users.update") ? (row) => navigate(`/users/${row.id}/edit`) : undefined}
              />
            </div>
            <div className="grid gap-2 md:hidden">
              {usersQuery.isPending ? (
                <p className="rounded-lg border border-border bg-card px-4 py-5 text-sm text-muted-foreground">جاري تحميل المستخدمين...</p>
              ) : (pageData?.items ?? []).length === 0 ? (
                <EmptyState compact action={can("users.create") ? <Button asChild size="sm"><Link to="/users/new">إضافة مستخدم</Link></Button> : undefined} description="لا توجد حسابات مستخدمين في الصفحة الحالية." title="لا يوجد مستخدمون" />
              ) : null}
              {(pageData?.items ?? []).map((user) => (
                <div key={user.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{user.full_name || user.email}</p>
                      <p className="mt-1 font-numeric text-meta">{user.email}</p>
                    </div>
                    <UserStatusBadge user={user} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <UserRoleBadge user={user} />
                    <div className="flex gap-2">
                      <Can permission="users.update">
                        <Button asChild className="rounded-full" size="sm" variant="outline"><Link to={`/users/${user.id}/edit`}>تعديل</Link></Button>
                      </Can>
                      <Can permission="users.delete">
                        <Button className="rounded-full" size="sm" variant="destructive" onClick={() => setDeleteTarget(user)}>حذف</Button>
                      </Can>
                    </div>
                  </div>
                </div>
              ))}
              {paginationProps ? <Pagination {...paginationProps} isFetching={usersQuery.isFetching && !usersQuery.isPending} /> : null}
            </div>
          </>
        )}
        <ConfirmDialog
          open={deleteTarget !== null}
          title="حذف المستخدم"
          description={deleteError ?? `سيتم حذف حساب ${deleteTarget?.email ?? "المستخدم"} عبر DELETE /users/{user_id}.`}
          confirmLabel="حذف المستخدم"
          isLoading={deleteMutation.isPending}
          onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setDeleteError(null); } }}
          onConfirm={() => void confirmDelete()}
        />
      </PageContainer>
    </motion.div>
  );
}
