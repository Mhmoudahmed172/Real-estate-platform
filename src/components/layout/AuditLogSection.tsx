import { useQuery } from "@tanstack/react-query";
import { auditApi } from "@/api/audit.api";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ActivityTimeline } from "@/components/layout/ActivityTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/format";
import { actorMeta, auditFieldLabels, formatAuditAction, formatAuditValue } from "@/lib/operationalLabels";
import { queryKeys } from "@/lib/queryKeys";
import { isRecord } from "@/lib/guards";

function flattenChanges(changes: Record<string, unknown> | null): string[] {
  if (!changes) return [];
  const lines: string[] = [];
  const visit = (prefix: string, value: unknown) => {
    if (value === null || value === undefined) return;
    if (isRecord(value)) {
      Object.entries(value).forEach(([key, nested]) => {
        if (["password", "hashed_password", "token", "access_token", "refresh_token", "jwt", "secret"].includes(key.toLowerCase())) {
          return;
        }
        visit(prefix ? `${prefix}.${key}` : key, nested);
      });
      return;
    }
    const leaf = prefix.split(".").pop() ?? prefix;
    if (leaf.endsWith("_id") || leaf === "id") return;
    const label = auditFieldLabels[leaf] ?? null;
    if (!label) return;
    const formatted = formatAuditValue(leaf, value);
    if (formatted) lines.push(`${label}: ${formatted}`);
  };
  visit("", changes);
  return lines.slice(0, 6);
}

export function AuditLogSection({
  entityType,
  entityId,
  enabled = true,
}: {
  entityType: "contract" | "payment" | "maintenance" | "user";
  entityId: number | undefined;
  enabled?: boolean;
}) {
  const query = useQuery({
    queryKey: queryKeys.audit.list(entityType, entityId ?? "unknown"),
    queryFn: () => auditApi.list({ entity_type: entityType, entity_id: entityId as number, limit: 20 }),
    enabled: enabled && typeof entityId === "number",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>سجل النشاط</CardTitle>
      </CardHeader>
      <CardContent>
        {query.isError ? (
          <ErrorState compact description="تعذر تحميل سجل النشاط." title="تعذر تحميل السجل" onRetry={() => void query.refetch()} />
        ) : (
          <ActivityTimeline
            emptyDescription="لا توجد أحداث مسجّلة على هذا السجل بعد."
            emptyTitle="لا يوجد نشاط"
            items={(query.data ?? []).map((event) => {
              const changes = flattenChanges(event.changes);
              return {
                id: String(event.id),
                title: formatAuditAction(event.action),
                description: changes.length ? changes.join(" · ") : null,
                meta: actorMeta(null),
                timestamp: formatDateTime(event.created_at),
              };
            })}
          />
        )}
      </CardContent>
    </Card>
  );
}
