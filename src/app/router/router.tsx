import { lazy, Suspense, type ComponentType, type ReactElement } from "react";
import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { GuestRoute } from "@/app/guards/GuestRoute";
import { HomeRedirect } from "@/app/guards/HomeRedirect";
import { PermissionGuard } from "@/app/guards/PermissionGuard";
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

const withSuspense = (element: ReactElement, fullScreen = false) => (
  <Suspense fallback={<LoadingState fullScreen={fullScreen} label="جاري تحميل الصفحة..." />}>{element}</Suspense>
);

const guarded = (permission: string, element: ReactElement) => (
  <PermissionGuard permission={permission}>{withSuspense(element)}</PermissionGuard>
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
const RolesPage = lazyPage(() => import("@/features/roles/RolesPage"), "RolesPage");
const ReportsPage = lazyPage(() => import("@/features/reports/ReportsPage"), "ReportsPage");

const routerBasename = import.meta.env.BASE_URL.replace(/\/+$/, "") || "/";

export const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter(
  [
  {
    path: "/login",
    element: <GuestRoute>{withSuspense(<LoginPage />, true)}</GuestRoute>,
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
      { index: true, element: <HomeRedirect /> },
      { path: "dashboard", element: guarded("dashboard.view", <DashboardPage />) },
      { path: "properties", element: guarded("properties.view", <PropertiesPage />) },
      { path: "properties/new", element: guarded("properties.create", <PropertyCreatePage />) },
      { path: "properties/:id", element: guarded("properties.view", <PropertyDetailsPage />) },
      { path: "properties/:id/edit", element: guarded("properties.update", <PropertyEditPage />) },
      { path: "units", element: guarded("units.view", <UnitsPage />) },
      { path: "units/new", element: guarded("units.create", <UnitCreatePage />) },
      { path: "units/:id", element: guarded("units.view", <UnitDetailsPage />) },
      { path: "units/:id/edit", element: guarded("units.update", <UnitEditPage />) },
      { path: "owners", element: guarded("owners.view", <OwnersPage />) },
      { path: "owners/new", element: guarded("owners.create", <OwnerCreatePage />) },
      { path: "owners/:id", element: guarded("owners.view", <OwnerDetailsPage />) },
      { path: "owners/:id/edit", element: guarded("owners.update", <OwnerEditPage />) },
      { path: "tenants", element: guarded("tenants.view", <TenantsPage />) },
      { path: "tenants/new", element: guarded("tenants.create", <TenantCreatePage />) },
      { path: "tenants/:id", element: guarded("tenants.view", <TenantDetailsPage />) },
      { path: "tenants/:id/edit", element: guarded("tenants.update", <TenantEditPage />) },
      { path: "contracts", element: guarded("contracts.view", <ContractsPage />) },
      { path: "contracts/new", element: guarded("contracts.create", <ContractCreatePage />) },
      { path: "contracts/:id", element: guarded("contracts.view", <ContractDetailsPage />) },
      { path: "contracts/:id/edit", element: guarded("contracts.update", <ContractEditPage />) },
      { path: "payments", element: guarded("payments.view", <PaymentsPage />) },
      { path: "payments/:id", element: guarded("payments.view", <PaymentDetailsPage />) },
      { path: "maintenance", element: guarded("maintenance.view", <MaintenancePage />) },
      { path: "maintenance/new", element: guarded("maintenance.create", <MaintenanceCreatePage />) },
      { path: "maintenance/:id", element: guarded("maintenance.view", <MaintenanceDetailsPage />) },
      { path: "maintenance/:id/edit", element: guarded("maintenance.update", <MaintenanceEditPage />) },
      { path: "services", element: guarded("services.view", <ServicesPage />) },
      { path: "services/new", element: guarded("services.create", <ServiceCreatePage />) },
      { path: "services/:id", element: guarded("services.view", <ServiceDetailsPage />) },
      { path: "services/:id/edit", element: guarded("services.update", <ServiceEditPage />) },
      { path: "vendors", element: guarded("vendors.view", <VendorsPage />) },
      { path: "vendors/new", element: guarded("vendors.create", <VendorCreatePage />) },
      { path: "vendors/:id", element: guarded("vendors.view", <VendorDetailsPage />) },
      { path: "vendors/:id/edit", element: guarded("vendors.update", <VendorEditPage />) },
      { path: "users", element: guarded("users.view", <UsersPage />) },
      { path: "users/new", element: guarded("users.create", <UserCreatePage />) },
      { path: "users/:id/edit", element: guarded("users.update", <UserEditPage />) },
      { path: "roles", element: guarded("roles.view", <RolesPage />) },
      { path: "reports", element: guarded("reports.view", <ReportsPage />) },
      { path: "reports/:kind", element: guarded("reports.view", <ReportsPage />) },
    ],
  },
  {
    path: "*",
    element: <ErrorState title="الصفحة غير موجودة" description="المسار المطلوب غير متاح ضمن نطاق المنتج الحالي." />,
  },
  ],
  { basename: routerBasename },
);
