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
import { Pagination } from "@/components/tables/Pagination";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useServiceOptions, useServicesPage } from "@/features/services/useServices";
import { formatCurrency, formatDate } from "@/lib/format";
import { missingLabel } from "@/lib/display";
import { pageMotion } from "@/lib/motion";
import { readPageParams, writePageParams } from "@/lib/pagination";
import type { ServiceOut } from "@/types/resources";

export function ServicesPage() {
  const navigate = useNavigate(); const [searchParams, setSearchParams] = useSearchParams(); const propertyId = searchParams.get("property_id") ? Number(searchParams.get("property_id")) : null; const pagination = readPageParams(searchParams);
  const { propertiesQuery, vendorsQuery } = useServiceOptions(); const params = useMemo(() => ({ property_id: propertyId, page: pagination.page, page_size: pagination.page_size }), [pagination.page, pagination.page_size, propertyId]); const listQuery = useServicesPage(params);
  const pageData = listQuery.data; const paginationProps = pageData ? { page: pageData.page, pageSize: pageData.page_size, total: pageData.total, totalPages: pageData.total_pages, onPageChange: (page: number) => setSearchParams(writePageParams(searchParams, { page })), onPageSizeChange: (page_size: typeof pageData.page_size) => setSearchParams(writePageParams(searchParams, { page_size })) } : undefined;
  const propertyNames = useMemo(() => new Map((propertiesQuery.data ?? []).map((item) => [item.id, item.label])), [propertiesQuery.data]); const vendorNames = useMemo(() => new Map((vendorsQuery.data ?? []).map((item) => [item.id, item.label])), [vendorsQuery.data]);
  function updateParams(next: Record<string, string | null>) { const resolved = new URLSearchParams(searchParams); Object.entries(next).forEach(([key, value]) => value ? resolved.set(key, value) : resolved.delete(key)); if (next.property_id !== undefined) resolved.delete("page"); setSearchParams(resolved); }
  const columns: Array<DataTableColumn<ServiceOut>> = [
    { id: "name", header: "الخدمة", cell: (row) => <div className="flex min-w-0 items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"><Settings2 aria-hidden="true" className="size-4" /></span><div><p className="font-semibold text-foreground">{row.service_name}</p><p className="text-meta">{propertyNames.get(row.property_id) ?? missingLabel("property")}</p></div></div> },
    { id: "provider", header: "المورد", cell: (row) => row.provider_id ? vendorNames.get(row.provider_id) ?? missingLabel("vendor") : "—" },
    { id: "cost", header: "التكلفة", numeric: true, cell: (row) => row.cost == null ? "—" : formatCurrency(row.cost) },
    { id: "due", header: "تاريخ الاستحقاق", cell: (row) => row.due_date ? formatDate(row.due_date) : "—" },
  ];
  return <motion.div {...pageMotion}><PageContainer><PageHeader eyebrow="الخدمات" title="الخدمات" description="إدارة خدمات العقارات وربطها بالموردين عند الحاجة." actions={<Can permission="services.create"><Button asChild className="rounded-full shadow-sm"><Link to="/services/new"><Plus aria-hidden="true" className="size-4" /> إضافة خدمة</Link></Button></Can>} />
    <section className="grid gap-4 rounded-xl border border-border bg-card p-4 shadow-card md:grid-cols-[1fr_auto] md:items-end"><div className="space-y-1.5"><p className="text-meta">العقار</p><Select value={propertyId ? String(propertyId) : "all"} onValueChange={(value) => updateParams({ property_id: value === "all" ? null : value })}><SelectTrigger className="rounded-xl"><SelectValue placeholder="كل العقارات" /></SelectTrigger><SelectContent><SelectItem value="all">كل العقارات</SelectItem>{(propertiesQuery.data ?? []).map((property) => <SelectItem key={property.id} value={String(property.id)}>{property.label}</SelectItem>)}</SelectContent></Select></div><Button className="h-11 rounded-xl" variant="outline" onClick={() => setSearchParams(new URLSearchParams())}>مسح التصفية</Button></section>
    {listQuery.isError ? <ErrorState title="تعذر تحميل الخدمات" description="تعذر تحميل قائمة الخدمات." onRetry={() => void listQuery.refetch()} /> : <><div className="hidden md:block"><DataTable actions={(row) => <><Button asChild className="rounded-full" size="sm" variant="ghost"><Link to={`/services/${row.id}`}>عرض</Link></Button><Can permission="services.update"><Button asChild className="rounded-full" size="sm" variant="outline"><Link to={`/services/${row.id}/edit`}>تعديل</Link></Button></Can></>} columns={columns} data={pageData?.items ?? []} emptyAction={<Can permission="services.create"><Button asChild size="sm"><Link to="/services/new">إضافة خدمة</Link></Button></Can>} emptyDescription="لا توجد خدمات مطابقة لعوامل التصفية الحالية." emptyTitle="لا توجد خدمات" getRowId={(row) => row.id} loading={listQuery.isPending} pagination={paginationProps} updating={listQuery.isFetching && !listQuery.isPending} onRowClick={(row) => navigate(`/services/${row.id}`)} /></div><div className="grid gap-2 md:hidden">{listQuery.isPending ? <p className="rounded-lg border border-border bg-card px-4 py-5 text-sm text-muted-foreground">جاري تحميل الخدمات...</p> : (pageData?.items ?? []).length === 0 ? <EmptyState compact action={<Can permission="services.create"><Button asChild size="sm"><Link to="/services/new">إضافة خدمة</Link></Button></Can>} description="لا توجد خدمات مطابقة لعوامل التصفية الحالية." title="لا توجد خدمات" /> : null}{(pageData?.items ?? []).map((service) => <Link key={service.id} className="rounded-xl border border-border bg-card p-4 shadow-card" to={`/services/${service.id}`}><p className="font-semibold text-foreground">{service.service_name}</p><p className="mt-1 text-meta">{propertyNames.get(service.property_id) ?? missingLabel("property")} · {service.cost == null ? "—" : formatCurrency(service.cost)}</p></Link>)}{paginationProps ? <Pagination {...paginationProps} isFetching={listQuery.isFetching && !listQuery.isPending} /> : null}</div></>}
  </PageContainer></motion.div>;
}
