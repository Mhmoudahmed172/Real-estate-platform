import type { PageParams, PageSize } from "@/types/api";

const PAGE_SIZES: PageSize[] = [10, 20, 50];

export function readPageParams(searchParams: URLSearchParams): PageParams {
  const requestedPage = Number(searchParams.get("page") ?? 1);
  const requestedSize = Number(searchParams.get("page_size") ?? 10);
  return {
    page: Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1,
    page_size: PAGE_SIZES.includes(requestedSize as PageSize) ? (requestedSize as PageSize) : 10,
  };
}

export function writePageParams(
  searchParams: URLSearchParams,
  next: Partial<PageParams>,
): URLSearchParams {
  const resolved = new URLSearchParams(searchParams);
  if (next.page !== undefined) {
    if (next.page > 1) resolved.set("page", String(next.page));
    else resolved.delete("page");
  }
  if (next.page_size !== undefined) {
    if (next.page_size !== 10) resolved.set("page_size", String(next.page_size));
    else resolved.delete("page_size");
    resolved.delete("page");
  }
  return resolved;
}
