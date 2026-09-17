export const permissionActionLabels: Record<string, string> = {
  view: "عرض",
  create: "إضافة",
  update: "تعديل",
  delete: "حذف",
  export: "تصدير",
};

export const permissionGroups = [
  { module: "dashboard", labelAr: "لوحة القيادة", actions: ["view"] },
  { module: "properties", labelAr: "العقارات", actions: ["view", "create", "update", "delete"] },
  { module: "units", labelAr: "الوحدات", actions: ["view", "create", "update", "delete"] },
  { module: "owners", labelAr: "الملاك", actions: ["view", "create", "update", "delete"] },
  { module: "tenants", labelAr: "المستأجرون", actions: ["view", "create", "update", "delete"] },
  { module: "contracts", labelAr: "العقود", actions: ["view", "create", "update", "delete"] },
  { module: "payments", labelAr: "المدفوعات", actions: ["view", "create", "update", "delete"] },
  { module: "maintenance", labelAr: "الصيانة", actions: ["view", "create", "update", "delete"] },
  { module: "services", labelAr: "الخدمات", actions: ["view", "create", "update", "delete"] },
  { module: "vendors", labelAr: "الموردون", actions: ["view", "create", "update", "delete"] },
  { module: "users", labelAr: "المستخدمون", actions: ["view", "create", "update", "delete"] },
  { module: "roles", labelAr: "الأدوار", actions: ["view", "create", "update", "delete"] },
  { module: "reports", labelAr: "التقارير", actions: ["view", "export"] },
] as const;

export function permissionCode(module: string, action: string) {
  return `${module}.${action}`;
}

export function allPermissionCodes() {
  return permissionGroups.flatMap((group) => group.actions.map((action) => permissionCode(group.module, action)));
}
