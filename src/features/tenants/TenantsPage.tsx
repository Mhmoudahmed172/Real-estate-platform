import { motion } from "framer-motion";
import { Mail, Phone, Plus, Search, UserRoundCheck } from "lucide-react";
import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Can } from "@/app/guards/Can";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthorization } from "@/features/auth/useAuthorization";
import { useTenantsList } from "@/features/tenants/useTenants";
import { pageMotion } from "@/lib/motion";
import type { TenantOut } from "@/types/resources";

const PAGE_SIZE = 20;

export function TenantsPage() {
  const { can } = useAuthorization();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const skip = Number(searchParams.get("skip") ?? 0);
  const params = useMemo(() => ({ q: query || undefined, skip, limit: PAGE_SIZE }), [query, skip]);
  const listQuery = useTenantsList(params);

  function updateParams(next: Record<string, string | null>) {
    const resolved = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value) resolved.set(key, value);
      else resolved.delete(key);
    });
    if (next.q !== undefined) resolved.delete("skip");
    setSearchParams(resolved);
  }

  const columns: Array<DataTableColumn<TenantOut>> = [
    {
      id: "name",
      header: "المستأجر",
      cell: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <UserRoundCheck aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{row.full_name}</p>
            <p className="text-meta">{row.national_id ?? "بدون رقم هوية"}</p>
          </div>
        </div>
      ),
    },
    { id: "phone", header: "الهاتف", cell: (row) => row.phone ?? "—" },
    { id: "email", header: "البريد", cell: (row) => row.email ?? "—" },
    { id: "national_id", header: "الهوية", cell: (row) => row.national_id ?? "—" },
  ];

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <PageHeader
          actions={
            <Can permission="tenants.create">
              <Button asChild className="rounded-full shadow-sm">
                <Link to="/tenants/new">
                  <Plus aria-hidden="true" className="size-4" />
                  إضافة مستأجر
                </Link>
              </Button>
            </Can>
          }
          description="إدارة بيانات المستأجرين ووسائل التواصل حسب الحقول الموثقة."
          eyebrow="إدارة الحسابات"
          title="المستأجرون"
        />
        <section className="grid gap-4 rounded-xl border border-border bg-card p-4 shadow-card md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <label className="block space-y-1.5">
            <span className="text-meta">بحث</span>
            <span className="relative block">
              <Search aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="rounded-xl bg-muted/70 pr-11"
                defaultValue={query}
                placeholder="ابحث باسم المستأجر"
                onBlur={(event) => updateParams({ q: event.target.value.trim() || null })}
                onKeyDown={(event) => {
                  if (event.key === "Enter") updateParams({ q: event.currentTarget.value.trim() || null });
                }}
              />
            </span>
          </label>
          <Button className="h-11 rounded-xl" variant="outline" onClick={() => setSearchParams(new URLSearchParams())}>
            مسح التصفية
          </Button>
        </section>
        {listQuery.isError ? (
          <ErrorState
            description="تعذر تحميل قائمة المستأجرين."
            title="تعذر تحميل المستأجرين"
            onRetry={() => void listQuery.refetch()}
          />
        ) : (
          <>
            <div className="hidden md:block">
              <DataTable
                actions={(row) => (
                  <>
                    <Button asChild className="rounded-full" size="sm" variant="ghost">
                      <Link to={`/tenants/${row.id}`}>عرض</Link>
                    </Button>
                    <Can permission="tenants.update">
                      <Button asChild className="rounded-full" size="sm" variant="outline">
                        <Link to={`/tenants/${row.id}/edit`}>تعديل</Link>
                      </Button>
                    </Can>
                  </>
                )}
                columns={columns}
                data={listQuery.data ?? []}
                emptyAction={
                  can("tenants.create") ? (
                    <Button asChild size="sm">
                      <Link to="/tenants/new">إضافة مستأجر</Link>
                    </Button>
                  ) : undefined
                }
                emptyDescription="لا توجد سجلات مستأجرين مطابقة."
                emptyTitle="لا يوجد مستأجرون"
                getRowId={(row) => row.id}
                hasMore={(listQuery.data?.length ?? 0) === PAGE_SIZE}
                hasPrevious={skip > 0}
                loading={listQuery.isPending}
                onNextPage={() => updateParams({ skip: String(skip + PAGE_SIZE) })}
                onPreviousPage={() => updateParams({ skip: skip <= PAGE_SIZE ? null : String(skip - PAGE_SIZE) })}
                onRowClick={(row) => navigate(`/tenants/${row.id}`)}
              />
            </div>
            <div className="grid gap-2 md:hidden">
              {listQuery.isPending ? (
                <p className="rounded-lg border border-border bg-card px-4 py-5 text-sm text-muted-foreground">جاري تحميل المستأجرين...</p>
              ) : (listQuery.data ?? []).length === 0 ? (
                <EmptyState
                  compact
                  action={
                    can("tenants.create") ? (
                      <Button asChild size="sm">
                        <Link to="/tenants/new">إضافة مستأجر</Link>
                      </Button>
                    ) : undefined
                  }
                  description="لا توجد سجلات مستأجرين مطابقة."
                  title="لا يوجد مستأجرون"
                />
              ) : null}
              {(listQuery.data ?? []).map((tenant) => (
                <Link
                  key={tenant.id}
                  className="rounded-xl border border-border bg-card p-4 shadow-card transition-all duration-fast hover:-translate-y-0.5 hover:shadow-card-hover"
                  to={`/tenants/${tenant.id}`}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <UserRoundCheck aria-hidden="true" className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{tenant.full_name}</p>
                      <p className="mt-1 flex items-center gap-1 text-meta">
                        <Phone aria-hidden="true" className="size-3.5" />
                        {tenant.phone ?? "بدون هاتف"}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-meta">
                        <Mail aria-hidden="true" className="size-3.5" />
                        {tenant.email ?? "بدون بريد"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </PageContainer>
    </motion.div>
  );
}
