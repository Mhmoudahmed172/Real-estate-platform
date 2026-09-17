import { motion } from "framer-motion";
import { Plus, Settings2 } from "lucide-react";
import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Can } from "@/app/guards/Can";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useServiceOptions, useServicesList } from "@/features/services/useServices";
import { formatCurrency, formatDate } from "@/lib/format";
import { pageMotion } from "@/lib/motion";
import type { ServiceOut } from "@/types/resources";

const PAGE_SIZE = 20;
export function ServicesPage() {
  const navigate = useNavigate(); const [searchParams, setSearchParams] = useSearchParams(); const propertyId = searchParams.get("property_id") ? Number(searchParams.get("property_id")) : null; const skip = Number(searchParams.get("skip") ?? 0);
  const { propertiesQuery, vendorsQuery } = useServiceOptions(); const params = useMemo(() => ({ property_id: propertyId, skip, limit: PAGE_SIZE }), [propertyId, skip]); const listQuery = useServicesList(params);
  const propertyNames = useMemo(() => new Map((propertiesQuery.data ?? []).map((item) => [item.id, item.name])), [propertiesQuery.data]); const vendorNames = useMemo(() => new Map((vendorsQuery.data ?? []).map((item) => [item.id, item.name])), [vendorsQuery.data]);
  function updateParams(next: Record<string, string | null>) { const resolved = new URLSearchParams(searchParams); Object.entries(next).forEach(([key, value]) => value ? resolved.set(key, value) : resolved.delete(key)); if (next.property_id !== undefined) resolved.delete("skip"); setSearchParams(resolved); }
  const columns: Array<DataTableColumn<ServiceOut>> = [
    { id: "name", header: "الخدمة", cell: (row) => <div className="flex min-w-0 items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"><Settings2 aria-hidden="true" className="size-4" /></span><div><p className="font-semibold text-foreground">{row.service_name}</p><p className="text-meta">{propertyNames.get(row.property_id) ?? `عقار #${row.property_id}`}</p></div></div> },
    { id: "provider", header: "المورد", cell: (row) => row.provider_id ? vendorNames.get(row.provider_id) ?? `#${row.provider_id}` : "—" },
    { id: "cost", header: "التكلفة", numeric: true, cell: (row) => row.cost == null ? "—" : formatCurrency(row.cost) },
    { id: "due", header: "تاريخ الاستحقاق", cell: (row) => row.due_date ? formatDate(row.due_date) : "—" },
  ];
  return <motion.div {...pageMotion}><PageContainer><PageHeader eyebrow="الخدمات" title="الخدمات" description="إدارة خدمات العقارات حسب property_id فقط كما يدعم OpenAPI." actions={<Can permission="services.create"><Button asChild className="rounded-full shadow-sm"><Link to="/services/new"><Plus aria-hidden="true" className="size-4" /> إضافة خدمة</Link></Button></Can>} />
    <section className="grid gap-4 rounded-xl border border-border bg-card p-4 shadow-card md:grid-cols-[1fr_auto] md:items-end"><div className="space-y-1.5"><p className="text-meta">العقار</p><Select value={propertyId ? String(propertyId) : "all"} onValueChange={(value) => updateParams({ property_id: value === "all" ? null : value })}><SelectTrigger className="rounded-xl"><SelectValue placeholder="كل العقارات" /></SelectTrigger><SelectContent><SelectItem value="all">كل العقارات</SelectItem>{(propertiesQuery.data ?? []).map((property) => <SelectItem key={property.id} value={String(property.id)}>{property.name}</SelectItem>)}</SelectContent></Select></div><Button className="h-11 rounded-xl" variant="outline" onClick={() => setSearchParams(new URLSearchParams())}>مسح التصفية</Button></section>
    {listQuery.isError ? <ErrorState title="تعذر تحميل الخدمات" description="تعذر تحميل قائمة الخدمات." onRetry={() => void listQuery.refetch()} /> : <><div className="hidden md:block"><DataTable actions={(row) => <><Button asChild className="rounded-full" size="sm" variant="ghost"><Link to={`/services/${row.id}`}>عرض</Link></Button><Can permission="services.update"><Button asChild className="rounded-full" size="sm" variant="outline"><Link to={`/services/${row.id}/edit`}>تعديل</Link></Button></Can></>} columns={columns} data={listQuery.data ?? []} emptyAction={<Can permission="services.create"><Button asChild size="sm"><Link to="/services/new">إضافة خدمة</Link></Button></Can>} emptyDescription="لا توجد خدمات مطابقة لعوامل التصفية الحالية." emptyTitle="لا توجد خدمات" getRowId={(row) => row.id} hasMore={(listQuery.data?.length ?? 0) === PAGE_SIZE} hasPrevious={skip > 0} loading={listQuery.isPending} onNextPage={() => updateParams({ skip: String(skip + PAGE_SIZE) })} onPreviousPage={() => updateParams({ skip: skip <= PAGE_SIZE ? null : String(skip - PAGE_SIZE) })} onRowClick={(row) => navigate(`/services/${row.id}`)} /></div><div className="grid gap-2 md:hidden">{listQuery.isPending ? <p className="rounded-lg border border-border bg-card px-4 py-5 text-sm text-muted-foreground">جاري تحميل الخدمات...</p> : (listQuery.data ?? []).length === 0 ? <EmptyState compact action={<Can permission="services.create"><Button asChild size="sm"><Link to="/services/new">إضافة خدمة</Link></Button></Can>} description="لا توجد خدمات مطابقة لعوامل التصفية الحالية." title="لا توجد خدمات" /> : null}{(listQuery.data ?? []).map((service) => <Link key={service.id} className="rounded-xl border border-border bg-card p-4 shadow-card" to={`/services/${service.id}`}><p className="font-semibold text-foreground">{service.service_name}</p><p className="mt-1 text-meta">{propertyNames.get(service.property_id) ?? `عقار #${service.property_id}`} · {service.cost == null ? "—" : formatCurrency(service.cost)}</p></Link>)}</div></>}
  </PageContainer></motion.div>;
}
