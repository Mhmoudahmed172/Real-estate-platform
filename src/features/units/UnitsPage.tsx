import { motion } from "framer-motion";
import { Building2, DoorOpen, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { UnitStatusBadge } from "@/components/ui/StatusBadge";
import { usePropertiesOptions, useUnitsList } from "@/features/units/useUnits";
import { formatCurrency, formatNumber } from "@/lib/format";
import { unitStatusLabels } from "@/lib/labels";
import { pageMotion } from "@/lib/motion";
import { unitStatuses, type UnitOut, type UnitStatus } from "@/types/resources";

const PAGE_SIZE = 20;

export function UnitsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [unitType, setUnitType] = useState(searchParams.get("unit_type") ?? "");
  const query = searchParams.get("q") ?? "";
  const status = (searchParams.get("status") as UnitStatus | null) ?? null;
  const propertyId = searchParams.get("property_id") ? Number(searchParams.get("property_id")) : null;
  const skip = Number(searchParams.get("skip") ?? 0);
  const propertiesQuery = usePropertiesOptions();

  const params = useMemo(
    () => ({
      q: query || undefined,
      status_filter: status,
      unit_type: unitType || undefined,
      property_id: propertyId,
      skip,
      limit: PAGE_SIZE,
    }),
    [propertyId, query, skip, status, unitType],
  );

  const listQuery = useUnitsList(params);
  const propertyNames = useMemo(
    () => new Map((propertiesQuery.data ?? []).map((property) => [property.id, property.name])),
    [propertiesQuery.data],
  );

  function updateParams(next: Record<string, string | null>) {
    const resolved = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value) resolved.set(key, value);
      else resolved.delete(key);
    });
    if (next.q !== undefined || next.unit_type !== undefined || next.status !== undefined || next.property_id !== undefined) {
      resolved.delete("skip");
    }
    setSearchParams(resolved);
  }

  const columns: Array<DataTableColumn<UnitOut>> = [
    {
      id: "number",
      header: "الوحدة",
      cell: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <DoorOpen aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{row.unit_number}</p>
            <p className="text-meta">{propertyNames.get(row.property_id) ?? `عقار #${row.property_id}`}</p>
          </div>
        </div>
      ),
    },
    { id: "type", header: "النوع", cell: (row) => row.unit_type ?? "—" },
    { id: "floor", header: "الدور", numeric: true, cell: (row) => row.floor ?? "—" },
    { id: "rooms", header: "الغرف", numeric: true, cell: (row) => row.rooms_count ?? "—" },
    { id: "area", header: "المساحة", numeric: true, cell: (row) => (row.area == null ? "—" : formatNumber(row.area, 1)) },
    { id: "rent", header: "الإيجار", numeric: true, cell: (row) => formatCurrency(row.rent_value) },
    { id: "status", header: "الحالة", cell: (row) => <UnitStatusBadge status={row.status} /> },
  ];

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <PageHeader
          actions={
            <Button asChild className="rounded-full shadow-sm">
              <Link to="/units/new">
                <Plus aria-hidden="true" className="size-4" />
                إضافة وحدة
              </Link>
            </Button>
          }
          description="إدارة الوحدات حسب العقار والحالة والحقول التي يدعمها عقد OpenAPI."
          eyebrow="إدارة المحفظة"
          title="الوحدات"
        />
        <section className="grid gap-4 rounded-xl border border-border bg-card p-4 shadow-card md:grid-cols-[minmax(0,1.4fr)_12rem_12rem_12rem_auto] md:items-end">
          <label className="block space-y-1.5">
            <span className="text-meta">بحث</span>
            <span className="relative block">
              <Search aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="rounded-xl bg-muted/70 pr-11"
                defaultValue={query}
                placeholder="ابحث برقم الوحدة"
                onBlur={(event) => updateParams({ q: event.target.value.trim() || null })}
                onKeyDown={(event) => {
                  if (event.key === "Enter") updateParams({ q: event.currentTarget.value.trim() || null });
                }}
              />
            </span>
          </label>
          <label className="block space-y-1.5">
            <span className="text-meta">نوع الوحدة</span>
            <Input
              className="rounded-xl"
              placeholder="كل الأنواع"
              value={unitType}
              onChange={(event) => setUnitType(event.target.value)}
              onBlur={() => updateParams({ unit_type: unitType.trim() || null })}
            />
          </label>
          <div className="space-y-1.5">
            <p className="text-meta">العقار</p>
            <Select
              value={propertyId ? String(propertyId) : "all"}
              onValueChange={(value) => updateParams({ property_id: value === "all" ? null : value })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="كل العقارات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل العقارات</SelectItem>
                {(propertiesQuery.data ?? []).map((property) => (
                  <SelectItem key={property.id} value={String(property.id)}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <p className="text-meta">الحالة</p>
            <Select value={status ?? "all"} onValueChange={(value) => updateParams({ status: value === "all" ? null : value })}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="كل الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                {unitStatuses.map((item) => (
                  <SelectItem key={item} value={item}>
                    {unitStatusLabels[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="h-11 rounded-xl"
            variant="outline"
            onClick={() => {
              setUnitType("");
              setSearchParams(new URLSearchParams());
            }}
          >
            مسح التصفية
          </Button>
        </section>
        {listQuery.isError ? (
          <ErrorState
            description="تعذر تحميل قائمة الوحدات."
            title="تعذر تحميل الوحدات"
            onRetry={() => void listQuery.refetch()}
          />
        ) : (
          <>
            <div className="hidden md:block">
              <DataTable
                actions={(row) => (
                  <>
                    <Button asChild className="rounded-full" size="sm" variant="ghost">
                      <Link to={`/units/${row.id}`}>عرض</Link>
                    </Button>
                    <Button asChild className="rounded-full" size="sm" variant="outline">
                      <Link to={`/units/${row.id}/edit`}>تعديل</Link>
                    </Button>
                  </>
                )}
                columns={columns}
                data={listQuery.data ?? []}
                emptyAction={
                  <Button asChild size="sm">
                    <Link to="/units/new">إضافة وحدة</Link>
                  </Button>
                }
                emptyDescription="لا توجد وحدات مطابقة لعوامل التصفية الحالية."
                emptyTitle="لا توجد وحدات"
                getRowId={(row) => row.id}
                hasMore={(listQuery.data?.length ?? 0) === PAGE_SIZE}
                hasPrevious={skip > 0}
                loading={listQuery.isPending}
                onNextPage={() => updateParams({ skip: String(skip + PAGE_SIZE) })}
                onPreviousPage={() => updateParams({ skip: skip <= PAGE_SIZE ? null : String(skip - PAGE_SIZE) })}
                onRowClick={(row) => navigate(`/units/${row.id}`)}
              />
            </div>
            <div className="grid gap-2 md:hidden">
              {listQuery.isPending ? (
                <p className="rounded-lg border border-border bg-card px-4 py-5 text-sm text-muted-foreground">جاري تحميل الوحدات...</p>
              ) : (listQuery.data ?? []).length === 0 ? (
                <EmptyState
                  compact
                  action={
                    <Button asChild size="sm">
                      <Link to="/units/new">إضافة وحدة</Link>
                    </Button>
                  }
                  description="لا توجد وحدات مطابقة لعوامل التصفية الحالية."
                  title="لا توجد وحدات"
                />
              ) : null}
              {(listQuery.data ?? []).map((unit) => (
                <Link
                  key={unit.id}
                  className="rounded-xl border border-border bg-card p-4 shadow-card transition-all duration-fast hover:-translate-y-0.5 hover:shadow-card-hover"
                  to={`/units/${unit.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                        <Building2 aria-hidden="true" className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{unit.unit_number}</p>
                        <p className="mt-1 text-meta">
                          {propertyNames.get(unit.property_id) ?? `عقار #${unit.property_id}`} · {unit.unit_type ?? "بدون نوع"}
                        </p>
                      </div>
                    </div>
                    <UnitStatusBadge status={unit.status} />
                  </div>
                  <p className="mt-2 text-meta">{formatCurrency(unit.rent_value)}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </PageContainer>
    </motion.div>
  );
}
