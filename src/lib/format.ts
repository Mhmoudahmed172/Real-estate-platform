const latinAr = { locale: "ar-SA", numberingSystem: "latn" } as const;

export function formatNumber(value: number, fractionDigits = 0) {
  return new Intl.NumberFormat(latinAr.locale, {
    numberingSystem: latinAr.numberingSystem,
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatCurrency(value: number) {
  return `${formatNumber(value)} ر.س`;
}

export function formatPercent(value: number, fractionDigits = 1) {
  return `${formatNumber(value, fractionDigits)}%`;
}

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(latinAr.locale, {
    numberingSystem: latinAr.numberingSystem,
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatMonthYear(year: number, monthIndex: number) {
  return new Intl.DateTimeFormat(latinAr.locale, {
    numberingSystem: latinAr.numberingSystem,
    month: "long",
  }).format(new Date(year, monthIndex, 1));
}

export function parseMoney(value: string | number | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value.trim())) return Number(value);
  return null;
}

export function currentYearRangeLabel(year = new Date().getFullYear()) {
  return `يناير ${year} — ديسمبر ${year}`;
}
