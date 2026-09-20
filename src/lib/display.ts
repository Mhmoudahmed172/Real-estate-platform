const DEMO_MARKER = "DEMO-SAKANFLOW";

export function formatDemoReference(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.replace(/^DEMO-/i, "");
}

export function formatDisplayText(value: string | null | undefined) {
  if (!value) return null;
  const cleaned = value
    .replaceAll(DEMO_MARKER, "")
    .replace(/^DEMO-/i, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || null;
}

export function formatIdentity(value: string | null | undefined) {
  return formatDemoReference(value);
}

export function missingLabel(kind: "property" | "unit" | "owner" | "tenant" | "vendor" | "contract") {
  const labels = {
    property: "عقار غير متوفر",
    unit: "وحدة غير متوفرة",
    owner: "مالك غير متوفر",
    tenant: "مستأجر غير متوفر",
    vendor: "مورد غير متوفر",
    contract: "عقد غير متوفر",
  } as const;
  return labels[kind];
}

export function relationLabel(
  value: string | null | undefined,
  kind: "property" | "unit" | "owner" | "tenant" | "vendor" | "contract",
) {
  return value?.trim() || missingLabel(kind);
}
