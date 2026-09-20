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
  label: string;
  href: string;
  icon: LucideIcon;
  permission: string;
};

export const navigationItems: NavigationItem[] = [
  { key: "dashboard", label: "لوحة القيادة", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
  { key: "properties", label: "العقارات", href: "/properties", icon: Building2, permission: "properties.view" },
  { key: "units", label: "الوحدات", href: "/units", icon: Landmark, permission: "units.view" },
  { key: "owners", label: "الملاك", href: "/owners", icon: Home, permission: "owners.view" },
  { key: "tenants", label: "المستأجرون", href: "/tenants", icon: Users, permission: "tenants.view" },
  { key: "contracts", label: "العقود", href: "/contracts", icon: ClipboardList, permission: "contracts.view" },
  { key: "payments", label: "المدفوعات", href: "/payments", icon: Receipt, permission: "payments.view" },
  { key: "maintenance", label: "الصيانة", href: "/maintenance", icon: Wrench, permission: "maintenance.view" },
  { key: "services", label: "الخدمات", href: "/services", icon: Settings2, permission: "services.view" },
  { key: "vendors", label: "الموردون", href: "/vendors", icon: Hammer, permission: "vendors.view" },
  { key: "users", label: "المستخدمون", href: "/users", icon: Users, permission: "users.view" },
  { key: "roles", label: "الأدوار والصلاحيات", href: "/roles", icon: ShieldCheck, permission: "roles.view" },
  { key: "reports", label: "التقارير", href: "/reports", icon: BarChart3, permission: "reports.view" },
];

export const quickActions = [
  { label: "إضافة عقار", icon: Building2 },
  { label: "إنشاء عقد", icon: ClipboardList },
  { label: "تسجيل دفعة", icon: HandCoins },
];
