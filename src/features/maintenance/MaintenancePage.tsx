import { motion } from "framer-motion";
import { Hammer, Plus } from "lucide-react";
import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Can } from "@/app/guards/Can";
import { ActiveFilterBanner } from "@/components/feedback/ActiveFilterBanner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Pagination } from "@/components/tables/Pagination";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { MaintenancePriorityBadge, MaintenanceStatusBadge } from "@/components/ui/StatusBadge";
import { useMaintenanceOptions, useMaintenancePage } from "@/features/maintenance/useMaintenance";
import { missingLabel } from "@/lib/display";
import { formatCurrency } from "@/lib/format";
import { maintenancePriorityLabels, maintenanceStatusLabels } from "@/lib/labels";
import { pageMotion } from "@/lib/motion";
import { readPageParams, writePageParams } from "@/lib/pagination";
import { maintenanceStatuses, type MaintenanceOut, type MaintenancePriority, type MaintenanceStatus } from "@/types/resources";

export function MaintenancePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const propertyId = searchParams.get("property_id") ? Number(searchParams.get("property_id")) : null;
  const status = ((searchParams.get("status_filter") ?? searchParams.get("status")) as MaintenanceStatus | null) ?? null;
  const priority = (searchParams.get("priority_filter") as MaintenancePriority | null) ?? null;
  const openOnly = searchParams.get("open") === "true" || searchParams.get("open") === "1";
  const overdue = searchParams.get("overdue") === "true" || searchParams.get("overdue") === "1";
  const pagination = readPageParams(searchParams);
  const { propertiesQuery, vendorsQuery } = useMaintenanceOptions();
  const params = useMemo(() => ({ property_id: propertyId, status_filter: status, priority_filter: priority, open: openOnly || null, overdue: overdue || null, page: pagination.page, page_size: pagination.page_size }), [openOnly, overdue, pagination.page, pagination.page_size, priority, propertyId, status]);
  const listQuery = useMaintenancePage(params);
  const pageData = listQuery.data;
  const paginationProps = pageData ? { page: pageData.page, pageSize: pageData.page_size, total: pageData.total, totalPages: pageData.total_pages, onPageChange: (page: number) => setSearchParams(writePageParams(searchParams, { page })), onPageSizeChange: (page_size: typeof pageData.page_size) => setSearchParams(writePageParams(searchParams, { page_size })) } : undefined;
  const propertyNames = useMemo(() => new Map((propertiesQuery.data ?? []).map((item) => [item.id, item.label])), [propertiesQuery.data]);
  const vendorNames = useMemo(() => new Map((vendorsQuery.data ?? []).map((item) => [item.id, item.label])), [vendorsQuery.data]);
  function updateParams(next: Record<string, string | null>) { const resolved = new URLSearchParams(searchParams); Object.entries(next).forEach(([key, value]) => value ? resolved.set(key, value) : resolved.delete(key)); if (next.property_id !== undefined || next.status !== undefined) resolved.delete("page"); setSearchParams(resolved); }
  const columns: Array<DataTableColumn<MaintenanceOut>> = [
    { id: "request", header: "البلاغ", cell: (row) => <div className="flex min-w-0 items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"><Hammer aria-hidden="true" className="size-4" /></span><div><p className="font-semibold text-foreground">{row.issue_type}</p><p className="text-meta">{row.property_id ? propertyNames.get(row.property_id) ?? missingLabel("property") : "بدون عقار"}</p></div></div> },
    { id: "priority", header: "الأولوية", cell: (row) => row.priority ? <MaintenancePriorityBadge priority={row.priority} /> : "—" },
    { id: "status", header: "الحالة", cell: (row) => <MaintenanceStatusBadge status={row.status} /> },
    { id: "vendor", header: "المورد", cell: (row) => row.vendor_id ? vendorNames.get(row.vendor_id) ?? missingLabel("vendor") : "غير مسند" },
    { id: "cost", header: "التكلفة", numeric: true, cell: (row) => formatCurrency(row.cost) },
    { id: "date", header: "تاريخ التنفيذ", cell: (row) => row.execution_date ?? "—" },
  ];
  return <motion.div {...pageMotion}><PageContainer><PageHeader eyebrow="الصيانة" title="بلاغات الصيانة" description="متابعة بلاغات الصيانة حسب العقار والحالة." actions={<Can permission="maintenance.create"><Button asChild className="rounded-full shadow-sm"><Link to="/maintenance/new"><Plus aria-hidden="true" className="size-4" /> بلاغ جديد</Link></Button></Can>} />
    <section className="grid gap-4 rounded-xl border border-border bg-card p-4 shadow-card md:grid-cols-[1fr_1fr_auto] md:items-end"><div className="space-y-1.5"><p className="text-meta">العقار</p><Select value={propertyId ? String(propertyId) : "all"} onValueChange={(value) => updateParams({ property_id: value === "all" ? null : value })}><SelectTrigger className="rounded-xl"><SelectValue placeholder="كل العقارات" /></SelectTrigger><SelectContent><SelectItem value="all">كل العقارات</SelectItem>{(propertiesQuery.data ?? []).map((property) => <SelectItem key={property.id} value={String(property.id)}>{property.label}</SelectItem>)}</SelectContent></Select></div><div className="space-y-1.5"><p className="text-meta">الحالة</p><Select value={status ?? "all"} onValueChange={(value) => updateParams({ status: value === "all" ? null : value })}><SelectTrigger className="rounded-xl"><SelectValue placeholder="كل الحالات" /></SelectTrigger><SelectContent><SelectItem value="all">كل الحالات</SelectItem>{maintenanceStatuses.map((item) => <SelectItem key={item} value={item}>{maintenanceStatusLabels[item]}</SelectItem>)}</SelectContent></Select></div><Button className="h-11 rounded-xl" variant="outline" onClick={() => setSearchParams(new URLSearchParams())}>مسح التصفية</Button></section>
    {priority || openOnly || overdue ? <ActiveFilterBanner description={[priority ? `الأولوية: ${maintenancePriorityLabels[priority]}` : null, openOnly ? "البلاغات المفتوحة فقط" : null, overdue ? "البلاغات المتأخرة" : null].filter(Boolean).join(" · ")} label="تصفية تشغيلية نشطة" /> : null}
    {listQuery.isError ? <ErrorState title="تعذر تحميل البلاغات" description="تعذر تحميل قائمة بلاغات الصيانة." onRetry={() => void listQuery.refetch()} /> : <><div className="hidden md:block"><DataTable actions={(row) => <><Button asChild className="rounded-full" size="sm" variant="ghost"><Link to={`/maintenance/${row.id}`}>عرض</Link></Button><Can permission="maintenance.update"><Button asChild className="rounded-full" size="sm" variant="outline"><Link to={`/maintenance/${row.id}/edit`}>تعديل</Link></Button></Can></>} columns={columns} data={pageData?.items ?? []} emptyAction={<Can permission="maintenance.create"><Button asChild size="sm"><Link to="/maintenance/new">بلاغ جديد</Link></Button></Can>} emptyDescription="لا توجد بلاغات مطابقة لعوامل التصفية الحالية." emptyTitle="لا توجد بلاغات" getRowId={(row) => row.id} loading={listQuery.isPending} pagination={paginationProps} updating={listQuery.isFetching && !listQuery.isPending} onRowClick={(row) => navigate(`/maintenance/${row.id}`)} /></div><div className="grid gap-2 md:hidden">{listQuery.isPending ? <p className="rounded-lg border border-border bg-card px-4 py-5 text-sm text-muted-foreground">جاري تحميل البلاغات...</p> : (pageData?.items ?? []).length === 0 ? <EmptyState compact action={<Can permission="maintenance.create"><Button asChild size="sm"><Link to="/maintenance/new">بلاغ جديد</Link></Button></Can>} description="لا توجد بلاغات مطابقة لعوامل التصفية الحالية." title="لا توجد بلاغات" /> : null}{(pageData?.items ?? []).map((request) => <Link key={request.id} className="rounded-xl border border-border bg-card p-4 shadow-card" to={`/maintenance/${request.id}`}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-foreground">{request.issue_type}</p><p className="mt-1 text-meta">{request.property_id ? propertyNames.get(request.property_id) ?? missingLabel("property") : "بدون عقار"}</p></div><MaintenanceStatusBadge status={request.status} /></div><p className="mt-2 text-meta">{formatCurrency(request.cost)}</p></Link>)}{paginationProps ? <Pagination {...paginationProps} isFetching={listQuery.isFetching && !listQuery.isPending} /> : null}</div></>}
  </PageContainer></motion.div>;
}
