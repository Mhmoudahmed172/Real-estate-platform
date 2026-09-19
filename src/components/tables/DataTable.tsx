import type { ReactNode } from "react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { DataTableShell } from "@/components/tables/DataTableShell";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  numeric?: boolean;
};

type DataTableProps<T> = {
  columns: Array<DataTableColumn<T>>;
  data: T[];
  getRowId: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => ReactNode;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  pageSize?: number;
  hasMore?: boolean;
  hasPrevious?: boolean;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
};

export function DataTable<T>({
  columns,
  data,
  getRowId,
  onRowClick,
  actions,
  loading = false,
  emptyTitle = "لا توجد سجلات",
  emptyDescription,
  emptyAction,
  hasMore = false,
  hasPrevious = false,
  onNextPage,
  onPreviousPage,
}: DataTableProps<T>) {
  const visibleColumns = actions ? columns.length + 1 : columns.length;

  return (
    <DataTableShell>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-muted/40">
            <tr className="border-b border-border text-muted-foreground">
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={cn(
                    "px-4 py-3 text-start text-[11px] font-semibold first:pe-5 last:ps-5",
                    column.numeric && "font-numeric tabular-nums",
                    column.className,
                  )}
                  scope="col"
                >
                  {column.header}
                </th>
              ))}
              {actions ? (
                <th className="w-0 px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-[0.08em]" scope="col">
                  إجراءات
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="border-b border-border/70">
                  {Array.from({ length: visibleColumns }).map((__, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3.5 first:pe-5 last:ps-5">
                      <Skeleton className="h-3.5 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td className="px-5 py-6" colSpan={visibleColumns}>
                  <EmptyState action={emptyAction} compact description={emptyDescription} title={emptyTitle} />
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={getRowId(row)}
                  className={cn(
                    "border-b border-border/70 last:border-0 focus-within:bg-muted/60",
                    onRowClick && "cursor-pointer transition-colors duration-fast hover:bg-muted/70",
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn("px-4 py-3.5 align-middle leading-6 text-foreground first:pe-5 last:ps-5", column.numeric && "font-numeric tabular-nums", column.className)}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                  {actions ? (
                    <td className="whitespace-nowrap px-4 py-3.5 align-middle">
                      <div
                        className="flex items-center gap-1.5"
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        {actions(row)}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {onNextPage || onPreviousPage ? (
        <div className="flex flex-col gap-3 border-t border-border bg-muted/35 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-meta">تصفح النتائج حسب حد القائمة</p>
          <div className="flex items-center gap-2">
            <Button className="rounded-full" disabled={!hasPrevious || loading} size="sm" variant="outline" onClick={onPreviousPage}>
              السابق
            </Button>
            <Button className="rounded-full" disabled={!hasMore || loading} size="sm" variant="outline" onClick={onNextPage}>
              التالي
            </Button>
          </div>
        </div>
      ) : null}
    </DataTableShell>
  );
}
