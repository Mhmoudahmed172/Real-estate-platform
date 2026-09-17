import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  ClipboardList,
  Hammer,
  HandCoins,
  Home,
  Landmark,
  LayoutDashboard,
  Receipt,
  Settings2,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";

export type AppRouteKey =
  | "dashboard"
  | "properties"
  | "units"
  | "owners"
  | "tenants"
  | "contracts"
  | "payments"
  | "maintenance"
  | "services"
  | "vendors"
  | "users"
  | "roles"
  | "reports";

export type NavigationItem = {
  key: AppRouteKey;
  labelAr: string;
  labelEn: string;
  href: string;
  icon: LucideIcon;
  permission: string;
};

export const navigationItems: NavigationItem[] = [
  { key: "dashboard", labelAr: "لوحة القيادة", labelEn: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
  { key: "properties", labelAr: "العقارات", labelEn: "Properties", href: "/properties", icon: Building2, permission: "properties.view" },
  { key: "units", labelAr: "الوحدات", labelEn: "Units", href: "/units", icon: Landmark, permission: "units.view" },
  { key: "owners", labelAr: "الملاك", labelEn: "Owners", href: "/owners", icon: Home, permission: "owners.view" },
  { key: "tenants", labelAr: "المستأجرون", labelEn: "Tenants", href: "/tenants", icon: Users, permission: "tenants.view" },
  { key: "contracts", labelAr: "العقود", labelEn: "Contracts", href: "/contracts", icon: ClipboardList, permission: "contracts.view" },
  { key: "payments", labelAr: "المدفوعات", labelEn: "Payments", href: "/payments", icon: Receipt, permission: "payments.view" },
  { key: "maintenance", labelAr: "الصيانة", labelEn: "Maintenance", href: "/maintenance", icon: Wrench, permission: "maintenance.view" },
  { key: "services", labelAr: "الخدمات", labelEn: "Services", href: "/services", icon: Settings2, permission: "services.view" },
  { key: "vendors", labelAr: "الموردون", labelEn: "Vendors", href: "/vendors", icon: Hammer, permission: "vendors.view" },
  { key: "users", labelAr: "المستخدمون", labelEn: "Users", href: "/users", icon: Users, permission: "users.view" },
  { key: "roles", labelAr: "الأدوار والصلاحيات", labelEn: "Roles", href: "/roles", icon: ShieldCheck, permission: "roles.view" },
  { key: "reports", labelAr: "التقارير", labelEn: "Reports", href: "/reports", icon: BarChart3, permission: "reports.view" },
];

export const quickActions = [
  { label: "إضافة عقار", icon: Building2 },
  { label: "إنشاء عقد", icon: ClipboardList },
  { label: "تسجيل دفعة", icon: HandCoins },
];
