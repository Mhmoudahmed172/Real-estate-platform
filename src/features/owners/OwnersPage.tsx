import { motion } from "framer-motion";
import { Mail, Phone, Plus, Search, UserRound } from "lucide-react";
import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Can } from "@/app/guards/Can";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Pagination } from "@/components/tables/Pagination";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthorization } from "@/features/auth/useAuthorization";
import { useOwnersPage } from "@/features/owners/useOwners";
import { pageMotion } from "@/lib/motion";
import { readPageParams, writePageParams } from "@/lib/pagination";
import type { OwnerOut } from "@/types/resources";

export function OwnersPage() {
  const { can } = useAuthorization();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const pagination = readPageParams(searchParams);
  const params = useMemo(() => ({ q: query || undefined, ...pagination }), [pagination.page, pagination.page_size, query]);
  const listQuery = useOwnersPage(params);
  const pageData = listQuery.data;
  const paginationProps = pageData ? {
    page: pageData.page,
    pageSize: pageData.page_size,
    total: pageData.total,
    totalPages: pageData.total_pages,
    onPageChange: (page: number) => setSearchParams(writePageParams(searchParams, { page })),
    onPageSizeChange: (page_size: typeof pageData.page_size) => setSearchParams(writePageParams(searchParams, { page_size })),
  } : undefined;

  function updateParams(next: Record<string, string | null>) {
    const resolved = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value) resolved.set(key, value);
      else resolved.delete(key);
    });
    if (next.q !== undefined) resolved.delete("page");
    setSearchParams(resolved);
  }

  const columns: Array<DataTableColumn<OwnerOut>> = [
    {
      id: "name",
      header: "المالك",
      cell: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <UserRound aria-hidden="true" className="size-4" />
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
            <Can permission="owners.create">
              <Button asChild className="rounded-full shadow-sm">
                <Link to="/owners/new">
                  <Plus aria-hidden="true" className="size-4" />
                  إضافة مالك
                </Link>
              </Button>
            </Can>
          }
          description="إدارة بيانات الملاك ووسائل التواصل حسب الحقول الموثقة."
          eyebrow="إدارة الحسابات"
          title="الملاك"
        />
        <section className="grid gap-4 rounded-xl border border-border bg-card p-4 shadow-card md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <label className="block space-y-1.5">
            <span className="text-meta">بحث</span>
            <span className="relative block">
              <Search aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="rounded-xl bg-muted/70 pr-11"
                defaultValue={query}
                placeholder="ابحث باسم المالك"
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
            description="تعذر تحميل قائمة الملاك."
            title="تعذر تحميل الملاك"
            onRetry={() => void listQuery.refetch()}
          />
        ) : (
          <>
            <div className="hidden md:block">
              <DataTable
                actions={(row) => (
                  <>
                    <Button asChild className="rounded-full" size="sm" variant="ghost">
                      <Link to={`/owners/${row.id}`}>عرض</Link>
                    </Button>
                    <Can permission="owners.update">
                      <Button asChild className="rounded-full" size="sm" variant="outline">
                        <Link to={`/owners/${row.id}/edit`}>تعديل</Link>
                      </Button>
                    </Can>
                  </>
                )}
                columns={columns}
                data={pageData?.items ?? []}
                emptyAction={
                  can("owners.create") ? (
                    <Button asChild size="sm">
                      <Link to="/owners/new">إضافة مالك</Link>
                    </Button>
                  ) : undefined
                }
                emptyDescription="لا توجد سجلات ملاك مطابقة."
                emptyTitle="لا يوجد ملاك"
                getRowId={(row) => row.id}
                loading={listQuery.isPending}
                pagination={paginationProps}
                updating={listQuery.isFetching && !listQuery.isPending}
                onRowClick={(row) => navigate(`/owners/${row.id}`)}
              />
            </div>
            <div className="grid gap-2 md:hidden">
              {listQuery.isPending ? (
                <p className="rounded-lg border border-border bg-card px-4 py-5 text-sm text-muted-foreground">جاري تحميل الملاك...</p>
              ) : (pageData?.items ?? []).length === 0 ? (
                <EmptyState
                  compact
                  action={
                    can("owners.create") ? (
                      <Button asChild size="sm">
                        <Link to="/owners/new">إضافة مالك</Link>
                      </Button>
                    ) : undefined
                  }
                  description="لا توجد سجلات ملاك مطابقة."
                  title="لا يوجد ملاك"
                />
              ) : null}
              {(pageData?.items ?? []).map((owner) => (
                <Link
                  key={owner.id}
                  className="rounded-xl border border-border bg-card p-4 shadow-card transition-all duration-fast hover:-translate-y-0.5 hover:shadow-card-hover"
                  to={`/owners/${owner.id}`}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <UserRound aria-hidden="true" className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{owner.full_name}</p>
                      <p className="mt-1 flex items-center gap-1 text-meta">
                        <Phone aria-hidden="true" className="size-3.5" />
                        {owner.phone ?? "بدون هاتف"}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-meta">
                        <Mail aria-hidden="true" className="size-3.5" />
                        {owner.email ?? "بدون بريد"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
              {paginationProps ? <Pagination {...paginationProps} isFetching={listQuery.isFetching && !listQuery.isPending} /> : null}
            </div>
          </>
        )}
      </PageContainer>
    </motion.div>
  );
}
