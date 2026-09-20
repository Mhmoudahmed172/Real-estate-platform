import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PageSize } from "@/types/api";

type PaginationProps = {
  page: number;
  pageSize: PageSize;
  total: number;
  totalPages: number;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
};

function pageItems(page: number, totalPages: number): Array<number | string> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const visible = new Set([1, totalPages, page - 1, page, page + 1]);
  const pages = [...visible].filter((item) => item >= 1 && item <= totalPages).sort((a, b) => a - b);
  const items: Array<number | string> = [];
  pages.forEach((item, index) => {
    const previous = pages[index - 1];
    if (previous && item - previous > 1) items.push(`ellipsis-${previous}`);
    items.push(item);
  });
  return items;
}

export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  isFetching = false,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav
      aria-label="تصفح صفحات النتائج"
      className="border-t border-border bg-muted/45 px-4 py-3"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground" aria-live="polite">
            عرض {formatNumber(first)}–{formatNumber(last)} من أصل {formatNumber(total)}
          </p>
          {isFetching ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
              <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
              جاري التحديث
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2 sm:hidden">
          <Button
            aria-label="الصفحة السابقة"
            disabled={!hasPrevious || isFetching}
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronRight aria-hidden="true" className="size-4" />
            السابق
          </Button>
          <span className="text-xs font-semibold text-foreground">
            صفحة {formatNumber(page)} من {formatNumber(Math.max(totalPages, 1))}
          </span>
          <Button
            aria-label="الصفحة التالية"
            disabled={!hasNext || isFetching}
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page + 1)}
          >
            التالي
            <ChevronLeft aria-hidden="true" className="size-4" />
          </Button>
        </div>

        <div className="hidden items-center gap-1.5 sm:flex">
          <Button
            aria-label="الصفحة السابقة"
            className="rounded-lg"
            disabled={!hasPrevious || isFetching}
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronRight aria-hidden="true" className="size-4" />
            السابق
          </Button>
          {pageItems(page, totalPages).map((item) =>
            typeof item === "number" ? (
              <Button
                key={item}
                aria-current={item === page ? "page" : undefined}
                aria-label={`الصفحة ${item}`}
                className={cn("size-9 min-h-9 rounded-lg px-0", item === page && "border-primary bg-primary text-primary-foreground hover:bg-primary/90")}
                disabled={isFetching}
                size="sm"
                variant="outline"
                onClick={() => onPageChange(item)}
              >
                {formatNumber(item)}
              </Button>
            ) : (
              <span key={item} aria-hidden="true" className="w-7 text-center text-muted-foreground">…</span>
            ),
          )}
          <Button
            aria-label="الصفحة التالية"
            className="rounded-lg"
            disabled={!hasNext || isFetching}
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page + 1)}
          >
            التالي
            <ChevronLeft aria-hidden="true" className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-xs text-muted-foreground">عدد الصفوف:</span>
          <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value) as PageSize)}>
            <SelectTrigger aria-label="عدد الصفوف في الصفحة" className="h-9 min-h-9 w-20 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </nav>
  );
}
