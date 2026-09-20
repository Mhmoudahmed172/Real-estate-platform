import { motion } from "framer-motion";
import { Building2, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { PropertyStatusBadge } from "@/components/ui/StatusBadge";
import { useAuthorization } from "@/features/auth/useAuthorization";
import { usePropertiesPage } from "@/features/properties/useProperties";
import { propertyStatusLabels, propertyTypeLabels } from "@/lib/labels";
import { pageMotion } from "@/lib/motion";
import { readPageParams, writePageParams } from "@/lib/pagination";
import { propertyStatuses, type PropertyOut, type PropertyStatus } from "@/types/resources";

export function PropertiesPage() {
  const { can } = useAuthorization();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const query = searchParams.get("q") ?? "";
  const status = (searchParams.get("status") as PropertyStatus | null) ?? null;
  const pagination = readPageParams(searchParams);

  const params = useMemo(
    () => ({
      q: query || undefined,
      city: city || undefined,
      status_filter: status,
      ...pagination,
    }),
    [city, pagination.page, pagination.page_size, query, status],
  );

  const listQuery = usePropertiesPage(params);
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
    if (next.q !== undefined || next.city !== undefined || next.status !== undefined) {
      resolved.delete("page");
    }
    setSearchParams(resolved);
  }

  const columns: Array<DataTableColumn<PropertyOut>> = [
    {
      id: "name",
      header: "العقار",
      cell: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Building2 aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{row.name}</p>
            <p className="text-meta">{row.address ?? "بدون عنوان"}</p>
          </div>
        </div>
      ),
    },
    {
      id: "type",
      header: "النوع",
      cell: (row) => propertyTypeLabels[row.property_type],
    },
    {
      id: "city",
      header: "المدينة",
      cell: (row) => row.city ?? "—",
    },
    {
      id: "status",
      header: "الحالة",
      cell: (row) => <PropertyStatusBadge status={row.status} />,
    },
    {
      id: "units",
      header: "الوحدات",
      numeric: true,
      cell: (row) => row.units_count,
    },
    {
      id: "floors",
      header: "الأدوار",
      numeric: true,
      cell: (row) => row.floors_count ?? "—",
    },
  ];

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <PageHeader
          actions={
            <Can permission="properties.create">
              <Button asChild className="rounded-full shadow-sm">
                <Link to="/properties/new">
                  <Plus aria-hidden="true" className="size-4" />
                  إضافة عقار
                </Link>
              </Button>
            </Can>
          }
          description="بحث وتصنيف العقارات حسب الحالة والمدينة من عقد القائمة الحالي."
          eyebrow="إدارة المحفظة"
          title="العقارات"
        />
        <section className="grid gap-4 rounded-xl border border-border bg-card p-4 shadow-card md:grid-cols-[minmax(0,1.5fr)_11rem_12rem_auto] md:items-end">
          <label className="block space-y-1.5">
            <span className="text-meta">بحث</span>
            <span className="relative block">
              <Search aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="rounded-xl bg-muted/70 pr-11"
                defaultValue={query}
                placeholder="ابحث بالاسم أو العنوان"
                onBlur={(event) => updateParams({ q: event.target.value.trim() || null })}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    updateParams({ q: event.currentTarget.value.trim() || null });
                  }
                }}
              />
            </span>
          </label>
          <label className="block space-y-1.5">
            <span className="text-meta">المدينة</span>
            <Input
              className="rounded-xl"
              placeholder="كل المدن"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              onBlur={() => updateParams({ city: city.trim() || null })}
            />
          </label>
          <div className="space-y-1.5">
            <p className="text-meta">الحالة</p>
            <Select
              value={status ?? "all"}
              onValueChange={(value) => updateParams({ status: value === "all" ? null : value })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="كل الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                {propertyStatuses.map((item) => (
                  <SelectItem key={item} value={item}>
                    {propertyStatusLabels[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="h-11 rounded-xl"
            variant="outline"
            onClick={() => {
              setCity("");
              setSearchParams(new URLSearchParams());
            }}
          >
            مسح التصفية
          </Button>
        </section>
        {listQuery.isError ? (
          <ErrorState
            description="تعذر تحميل قائمة العقارات."
            title="تعذر تحميل العقارات"
            onRetry={() => void listQuery.refetch()}
          />
        ) : (
          <>
            <div className="hidden md:block">
              <DataTable
                actions={(row) => (
                  <>
                    <Button asChild className="rounded-full" size="sm" variant="ghost">
                      <Link to={`/properties/${row.id}`}>عرض</Link>
                    </Button>
                    <Can permission="properties.update">
                      <Button asChild className="rounded-full" size="sm" variant="outline">
                        <Link to={`/properties/${row.id}/edit`}>تعديل</Link>
                      </Button>
                    </Can>
                  </>
                )}
                columns={columns}
                data={pageData?.items ?? []}
                emptyAction={
                  can("properties.create") ? (
                    <Button asChild size="sm">
                      <Link to="/properties/new">إضافة عقار</Link>
                    </Button>
                  ) : undefined
                }
                emptyDescription="لا توجد عقارات مطابقة لعوامل التصفية الحالية."
                emptyTitle="لا توجد عقارات"
                getRowId={(row) => row.id}
                loading={listQuery.isPending}
                pagination={paginationProps}
                updating={listQuery.isFetching && !listQuery.isPending}
                onRowClick={(row) => navigate(`/properties/${row.id}`)}
              />
            </div>
            <div className="grid gap-2 md:hidden">
              {listQuery.isPending ? (
                <p className="rounded-lg border border-border bg-card px-4 py-5 text-sm text-muted-foreground">جاري تحميل العقارات...</p>
              ) : (pageData?.items ?? []).length === 0 ? (
                <EmptyState
                  compact
                  action={
                    can("properties.create") ? (
                      <Button asChild size="sm">
                        <Link to="/properties/new">إضافة عقار</Link>
                      </Button>
                    ) : undefined
                  }
                  description="لا توجد عقارات مطابقة لعوامل التصفية الحالية."
                  title="لا توجد عقارات"
                />
              ) : null}
              {(pageData?.items ?? []).map((property) => (
                <Link
                  key={property.id}
                  className="rounded-xl border border-border bg-card p-4 shadow-card transition-all duration-fast hover:-translate-y-0.5 hover:shadow-card-hover"
                  to={`/properties/${property.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                        <Building2 aria-hidden="true" className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{property.name}</p>
                        <p className="mt-1 text-meta">
                          {propertyTypeLabels[property.property_type]} · {property.city ?? "بدون مدينة"}
                        </p>
                      </div>
                    </div>
                    <PropertyStatusBadge status={property.status} />
                  </div>
                  <p className="mt-2 text-meta">{property.units_count} وحدة</p>
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
