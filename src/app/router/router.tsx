import { lazy, Suspense, type ComponentType, type ReactElement } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { GuestRoute } from "@/app/guards/GuestRoute";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { AppShell } from "@/components/layout/AppShell";

type LazyModule<TExport extends string> = Record<TExport, ComponentType>;

const lazyPage = <TExport extends string>(
  importer: () => Promise<LazyModule<TExport>>,
  exportName: TExport,
) =>
  lazy(async () => {
    const module = await importer();
    return { default: module[exportName] };
  });

const withSuspense = (element: ReactElement) => (
  <Suspense fallback={<LoadingState label="جاري تحميل الصفحة..." fullScreen />}>{element}</Suspense>
);

const LoginPage = lazyPage(() => import("@/features/auth/LoginPage"), "LoginPage");
const DashboardPage = lazyPage(() => import("@/features/dashboard/DashboardPage"), "DashboardPage");
const PropertiesPage = lazyPage(() => import("@/features/properties/PropertiesPage"), "PropertiesPage");
const PropertyCreatePage = lazyPage(() => import("@/features/properties/PropertyCreatePage"), "PropertyCreatePage");
const PropertyDetailsPage = lazyPage(() => import("@/features/properties/PropertyDetailsPage"), "PropertyDetailsPage");
const PropertyEditPage = lazyPage(() => import("@/features/properties/PropertyEditPage"), "PropertyEditPage");
const UnitsPage = lazyPage(() => import("@/features/units/UnitsPage"), "UnitsPage");
const UnitCreatePage = lazyPage(() => import("@/features/units/UnitCreatePage"), "UnitCreatePage");
const UnitDetailsPage = lazyPage(() => import("@/features/units/UnitDetailsPage"), "UnitDetailsPage");
const UnitEditPage = lazyPage(() => import("@/features/units/UnitEditPage"), "UnitEditPage");
const OwnersPage = lazyPage(() => import("@/features/owners/OwnersPage"), "OwnersPage");
const OwnerCreatePage = lazyPage(() => import("@/features/owners/OwnerCreatePage"), "OwnerCreatePage");
const OwnerDetailsPage = lazyPage(() => import("@/features/owners/OwnerDetailsPage"), "OwnerDetailsPage");
const OwnerEditPage = lazyPage(() => import("@/features/owners/OwnerEditPage"), "OwnerEditPage");
const TenantsPage = lazyPage(() => import("@/features/tenants/TenantsPage"), "TenantsPage");
const TenantCreatePage = lazyPage(() => import("@/features/tenants/TenantCreatePage"), "TenantCreatePage");
const TenantDetailsPage = lazyPage(() => import("@/features/tenants/TenantDetailsPage"), "TenantDetailsPage");
const TenantEditPage = lazyPage(() => import("@/features/tenants/TenantEditPage"), "TenantEditPage");
const ContractsPage = lazyPage(() => import("@/features/contracts/ContractsPage"), "ContractsPage");
const ContractCreatePage = lazyPage(() => import("@/features/contracts/ContractCreatePage"), "ContractCreatePage");
const ContractDetailsPage = lazyPage(() => import("@/features/contracts/ContractDetailsPage"), "ContractDetailsPage");
const ContractEditPage = lazyPage(() => import("@/features/contracts/ContractEditPage"), "ContractEditPage");
const PaymentsPage = lazyPage(() => import("@/features/payments/PaymentsPage"), "PaymentsPage");
const PaymentDetailsPage = lazyPage(() => import("@/features/payments/PaymentDetailsPage"), "PaymentDetailsPage");
const MaintenancePage = lazyPage(() => import("@/features/maintenance/MaintenancePage"), "MaintenancePage");
const MaintenanceCreatePage = lazyPage(() => import("@/features/maintenance/MaintenanceCreatePage"), "MaintenanceCreatePage");
const MaintenanceDetailsPage = lazyPage(() => import("@/features/maintenance/MaintenanceDetailsPage"), "MaintenanceDetailsPage");
const MaintenanceEditPage = lazyPage(() => import("@/features/maintenance/MaintenanceEditPage"), "MaintenanceEditPage");
const ServicesPage = lazyPage(() => import("@/features/services/ServicesPage"), "ServicesPage");
const ServiceCreatePage = lazyPage(() => import("@/features/services/ServiceCreatePage"), "ServiceCreatePage");
const ServiceDetailsPage = lazyPage(() => import("@/features/services/ServiceDetailsPage"), "ServiceDetailsPage");
const ServiceEditPage = lazyPage(() => import("@/features/services/ServiceEditPage"), "ServiceEditPage");
const VendorsPage = lazyPage(() => import("@/features/vendors/VendorsPage"), "VendorsPage");
const VendorCreatePage = lazyPage(() => import("@/features/vendors/VendorCreatePage"), "VendorCreatePage");
const VendorDetailsPage = lazyPage(() => import("@/features/vendors/VendorDetailsPage"), "VendorDetailsPage");
const VendorEditPage = lazyPage(() => import("@/features/vendors/VendorEditPage"), "VendorEditPage");
const UsersPage = lazyPage(() => import("@/features/users/UsersPage"), "UsersPage");
const UserCreatePage = lazyPage(() => import("@/features/users/UserCreatePage"), "UserCreatePage");
const UserEditPage = lazyPage(() => import("@/features/users/UserEditPage"), "UserEditPage");
const ReportsPage = lazyPage(() => import("@/features/reports/ReportsPage"), "ReportsPage");

const routerBasename = import.meta.env.BASE_URL.replace(/\/+$/, "") || "/";

export const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter(
  [
  {
    path: "/login",
    element: <GuestRoute>{withSuspense(<LoginPage />)}</GuestRoute>,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    errorElement: <ErrorState title="تعذر تحميل الصفحة" description="حدث خطأ غير متوقع أثناء فتح المسار." />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: withSuspense(<DashboardPage />) },
      { path: "properties", element: withSuspense(<PropertiesPage />) },
      { path: "properties/new", element: withSuspense(<PropertyCreatePage />) },
      { path: "properties/:id", element: withSuspense(<PropertyDetailsPage />) },
      { path: "properties/:id/edit", element: withSuspense(<PropertyEditPage />) },
      { path: "units", element: withSuspense(<UnitsPage />) },
      { path: "units/new", element: withSuspense(<UnitCreatePage />) },
      { path: "units/:id", element: withSuspense(<UnitDetailsPage />) },
      { path: "units/:id/edit", element: withSuspense(<UnitEditPage />) },
      { path: "owners", element: withSuspense(<OwnersPage />) },
      { path: "owners/new", element: withSuspense(<OwnerCreatePage />) },
      { path: "owners/:id", element: withSuspense(<OwnerDetailsPage />) },
      { path: "owners/:id/edit", element: withSuspense(<OwnerEditPage />) },
      { path: "tenants", element: withSuspense(<TenantsPage />) },
      { path: "tenants/new", element: withSuspense(<TenantCreatePage />) },
      { path: "tenants/:id", element: withSuspense(<TenantDetailsPage />) },
      { path: "tenants/:id/edit", element: withSuspense(<TenantEditPage />) },
      { path: "contracts", element: withSuspense(<ContractsPage />) },
      { path: "contracts/new", element: withSuspense(<ContractCreatePage />) },
      { path: "contracts/:id", element: withSuspense(<ContractDetailsPage />) },
      { path: "contracts/:id/edit", element: withSuspense(<ContractEditPage />) },
      { path: "payments", element: withSuspense(<PaymentsPage />) },
      { path: "payments/:id", element: withSuspense(<PaymentDetailsPage />) },
      { path: "maintenance", element: withSuspense(<MaintenancePage />) },
      { path: "maintenance/new", element: withSuspense(<MaintenanceCreatePage />) },
      { path: "maintenance/:id", element: withSuspense(<MaintenanceDetailsPage />) },
      { path: "maintenance/:id/edit", element: withSuspense(<MaintenanceEditPage />) },
      { path: "services", element: withSuspense(<ServicesPage />) },
      { path: "services/new", element: withSuspense(<ServiceCreatePage />) },
      { path: "services/:id", element: withSuspense(<ServiceDetailsPage />) },
      { path: "services/:id/edit", element: withSuspense(<ServiceEditPage />) },
      { path: "vendors", element: withSuspense(<VendorsPage />) },
      { path: "vendors/new", element: withSuspense(<VendorCreatePage />) },
      { path: "vendors/:id", element: withSuspense(<VendorDetailsPage />) },
      { path: "vendors/:id/edit", element: withSuspense(<VendorEditPage />) },
      { path: "users", element: withSuspense(<UsersPage />) },
      { path: "users/new", element: withSuspense(<UserCreatePage />) },
      { path: "users/:id/edit", element: withSuspense(<UserEditPage />) },
      { path: "reports", element: withSuspense(<ReportsPage />) },
      { path: "reports/:kind", element: withSuspense(<ReportsPage />) },
    ],
  },
  {
    path: "*",
    element: <ErrorState title="الصفحة غير موجودة" description="المسار المطلوب غير متاح ضمن نطاق المنتج الحالي." />,
  },
  ],
  { basename: routerBasename },
);
