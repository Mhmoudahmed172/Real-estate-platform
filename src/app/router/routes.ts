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
  | "reports";

export type NavigationItem = {
  key: AppRouteKey;
  labelAr: string;
  labelEn: string;
  href: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  { key: "dashboard", labelAr: "لوحة القيادة", labelEn: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "properties", labelAr: "العقارات", labelEn: "Properties", href: "/properties", icon: Building2 },
  { key: "units", labelAr: "الوحدات", labelEn: "Units", href: "/units", icon: Landmark },
  { key: "owners", labelAr: "الملاك", labelEn: "Owners", href: "/owners", icon: Home },
  { key: "tenants", labelAr: "المستأجرون", labelEn: "Tenants", href: "/tenants", icon: Users },
  { key: "contracts", labelAr: "العقود", labelEn: "Contracts", href: "/contracts", icon: ClipboardList },
  { key: "payments", labelAr: "المدفوعات", labelEn: "Payments", href: "/payments", icon: Receipt },
  { key: "maintenance", labelAr: "الصيانة", labelEn: "Maintenance", href: "/maintenance", icon: Wrench },
  { key: "services", labelAr: "الخدمات", labelEn: "Services", href: "/services", icon: Settings2 },
  { key: "vendors", labelAr: "الموردون", labelEn: "Vendors", href: "/vendors", icon: Hammer },
  { key: "users", labelAr: "المستخدمون", labelEn: "Users & Roles", href: "/users", icon: Users },
  { key: "reports", labelAr: "التقارير", labelEn: "Reports", href: "/reports", icon: BarChart3 },
];

export const quickActions = [
  { label: "إضافة عقار", icon: Building2 },
  { label: "إنشاء عقد", icon: ClipboardList },
  { label: "تسجيل دفعة", icon: HandCoins },
];
