import { motion } from "framer-motion";
import { ClipboardList, Plus } from "lucide-react";
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
import { ContractStatusBadge } from "@/components/ui/StatusBadge";
import { useContractOptions, useContractsList, useExpiringContracts } from "@/features/contracts/useContracts";
import { formatCurrency, formatDate, parseMoney } from "@/lib/format";
import { contractStatusLabels } from "@/lib/labels";
import { pageMotion } from "@/lib/motion";
import { contractStatuses, type ContractOut, type ContractStatus } from "@/types/resources";

const PAGE_SIZE = 20;

export function ContractsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const propertyId = searchParams.get("property_id") ? Number(searchParams.get("property_id")) : null;
  const ownerId = searchParams.get("owner_id") ? Number(searchParams.get("owner_id")) : null;
  const tenantId = searchParams.get("tenant_id") ? Number(searchParams.get("tenant_id")) : null;
  const status = (searchParams.get("status") as ContractStatus | null) ?? null;
  const skip = Number(searchParams.get("skip") ?? 0);
  const { propertiesQuery, ownersQuery, tenantsQuery } = useContractOptions();
  const expiringQuery = useExpiringContracts(30);

  const params = useMemo(() => ({ property_id: propertyId, owner_id: ownerId, tenant_id: tenantId, status_filter: status, skip, limit: PAGE_SIZE }), [ownerId, propertyId, skip, status, tenantId]);
  const listQuery = useContractsList(params);
  const propertyNames = useMemo(() => new Map((propertiesQuery.data ?? []).map((item) => [item.id, item.name])), [propertiesQuery.data]);
  const ownerNames = useMemo(() => new Map((ownersQuery.data ?? []).map((item) => [item.id, item.full_name])), [ownersQuery.data]);
  const tenantNames = useMemo(() => new Map((tenantsQuery.data ?? []).map((item) => [item.id, item.full_name])), [tenantsQuery.data]);

  function updateParams(next: Record<string, string | null>) {
    const resolved = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => value ? resolved.set(key, value) : resolved.delete(key));
    if (next.property_id !== undefined || next.owner_id !== undefined || next.tenant_id !== undefined || next.status !== undefined) resolved.delete("skip");
    setSearchParams(resolved);
  }

  const columns: Array<DataTableColumn<ContractOut>> = [
    { id: "contract", header: "العقد", cell: (row) => <div className="flex min-w-0 items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"><ClipboardList aria-hidden="true" className="size-4" /></span><div className="min-w-0"><p className="font-semibold text-foreground">عقد #{row.id}</p><p className="text-meta">{propertyNames.get(row.property_id) ?? `عقار #${row.property_id}`}</p></div></div> },
    { id: "tenant", header: "المستأجر", cell: (row) => tenantNames.get(row.tenant_id) ?? `مستأجر #${row.tenant_id}` },
    { id: "owner", header: "المالك", cell: (row) => ownerNames.get(row.owner_id) ?? `مالك #${row.owner_id}` },
    { id: "dates", header: "المدة", cell: (row) => `${formatDate(row.start_date)} - ${formatDate(row.end_date)}` },
    { id: "rent", header: "الإيجار", numeric: true, cell: (row) => formatCurrency(parseMoney(row.rent_value) ?? 0) },
    { id: "status", header: "الحالة", cell: (row) => <ContractStatusBadge status={row.status} /> },
  ];

  return <motion.div {...pageMotion}><PageContainer>
    <PageHeader eyebrow="إدارة العقود" title="العقود" description="قائمة العقود حسب فلاتر OpenAPI: العقار والمالك والمستأجر والحالة." actions={<Can permission="contracts.create"><Button asChild className="rounded-full shadow-sm"><Link to="/contracts/new"><Plus aria-hidden="true" className="size-4" /> إنشاء عقد</Link></Button></Can>} />
    <section className="grid gap-4 rounded-xl border border-border bg-card p-4 shadow-card md:grid-cols-5 md:items-end">
      <div className="space-y-1.5"><p className="text-meta">العقار</p><Select value={propertyId ? String(propertyId) : "all"} onValueChange={(value) => updateParams({ property_id: value === "all" ? null : value })}><SelectTrigger className="rounded-xl"><SelectValue placeholder="كل العقارات" /></SelectTrigger><SelectContent><SelectItem value="all">كل العقارات</SelectItem>{(propertiesQuery.data ?? []).map((property) => <SelectItem key={property.id} value={String(property.id)}>{property.name}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-1.5"><p className="text-meta">المالك</p><Select value={ownerId ? String(ownerId) : "all"} onValueChange={(value) => updateParams({ owner_id: value === "all" ? null : value })}><SelectTrigger className="rounded-xl"><SelectValue placeholder="كل الملاك" /></SelectTrigger><SelectContent><SelectItem value="all">كل الملاك</SelectItem>{(ownersQuery.data ?? []).map((owner) => <SelectItem key={owner.id} value={String(owner.id)}>{owner.full_name}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-1.5"><p className="text-meta">المستأجر</p><Select value={tenantId ? String(tenantId) : "all"} onValueChange={(value) => updateParams({ tenant_id: value === "all" ? null : value })}><SelectTrigger className="rounded-xl"><SelectValue placeholder="كل المستأجرين" /></SelectTrigger><SelectContent><SelectItem value="all">كل المستأجرين</SelectItem>{(tenantsQuery.data ?? []).map((tenant) => <SelectItem key={tenant.id} value={String(tenant.id)}>{tenant.full_name}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-1.5"><p className="text-meta">الحالة</p><Select value={status ?? "all"} onValueChange={(value) => updateParams({ status: value === "all" ? null : value })}><SelectTrigger className="rounded-xl"><SelectValue placeholder="كل الحالات" /></SelectTrigger><SelectContent><SelectItem value="all">كل الحالات</SelectItem>{contractStatuses.map((item) => <SelectItem key={item} value={item}>{contractStatusLabels[item]}</SelectItem>)}</SelectContent></Select></div>
      <Button className="h-11 rounded-xl" variant="outline" onClick={() => setSearchParams(new URLSearchParams())}>مسح التصفية</Button>
    </section>
    <section className="rounded-xl border border-border bg-card p-4 shadow-card"><div className="flex items-center justify-between gap-3"><div><h2 className="text-section text-foreground">عقود تنتهي خلال 30 يومًا</h2><p className="text-meta">من endpoint العقود القريبة من الانتهاء.</p></div><span className="font-numeric text-kpi text-primary">{expiringQuery.data?.length ?? "—"}</span></div></section>
    {listQuery.isError ? <ErrorState title="تعذر تحميل العقود" description="تعذر تحميل قائمة العقود." onRetry={() => void listQuery.refetch()} /> : <>
      <div className="hidden md:block"><DataTable actions={(row) => <><Button asChild className="rounded-full" size="sm" variant="ghost"><Link to={`/contracts/${row.id}`}>عرض</Link></Button><Can permission="contracts.update"><Button asChild className="rounded-full" size="sm" variant="outline"><Link to={`/contracts/${row.id}/edit`}>تعديل</Link></Button></Can></>} columns={columns} data={listQuery.data ?? []} emptyAction={<Can permission="contracts.create"><Button asChild size="sm"><Link to="/contracts/new">إنشاء عقد</Link></Button></Can>} emptyDescription="لا توجد عقود مطابقة لعوامل التصفية الحالية." emptyTitle="لا توجد عقود" getRowId={(row) => row.id} hasMore={(listQuery.data?.length ?? 0) === PAGE_SIZE} hasPrevious={skip > 0} loading={listQuery.isPending} onNextPage={() => updateParams({ skip: String(skip + PAGE_SIZE) })} onPreviousPage={() => updateParams({ skip: skip <= PAGE_SIZE ? null : String(skip - PAGE_SIZE) })} onRowClick={(row) => navigate(`/contracts/${row.id}`)} /></div>
      <div className="grid gap-2 md:hidden">{listQuery.isPending ? <p className="rounded-lg border border-border bg-card px-4 py-5 text-sm text-muted-foreground">جاري تحميل العقود...</p> : (listQuery.data ?? []).length === 0 ? <EmptyState compact action={<Can permission="contracts.create"><Button asChild size="sm"><Link to="/contracts/new">إنشاء عقد</Link></Button></Can>} description="لا توجد عقود مطابقة لعوامل التصفية الحالية." title="لا توجد عقود" /> : null}{(listQuery.data ?? []).map((contract) => <Link key={contract.id} className="rounded-xl border border-border bg-card p-4 shadow-card transition-all duration-fast hover:-translate-y-0.5 hover:shadow-card-hover" to={`/contracts/${contract.id}`}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-foreground">عقد #{contract.id}</p><p className="mt-1 text-meta">{tenantNames.get(contract.tenant_id) ?? `مستأجر #${contract.tenant_id}`} · {formatCurrency(parseMoney(contract.rent_value) ?? 0)}</p></div><ContractStatusBadge status={contract.status} /></div><p className="mt-2 text-meta">{formatDate(contract.start_date)} - {formatDate(contract.end_date)}</p></Link>)}</div>
    </>}
  </PageContainer></motion.div>;
}
