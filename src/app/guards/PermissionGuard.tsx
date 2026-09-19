import type { PropsWithChildren } from "react";
import { ShieldOff } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAuthorization } from "@/features/auth/useAuthorization";

type PermissionGuardProps = PropsWithChildren<{
  permission: string;
}>;

export function PermissionGuard({ permission, children }: PermissionGuardProps) {
  const { can } = useAuthorization();
  if (can(permission)) return <>{children}</>;

  return (
    <PageContainer>
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[14px] border border-border bg-card px-6 text-center shadow-card">
        <ShieldOff aria-hidden="true" className="mb-4 size-9 text-muted-foreground" />
        <h1 className="text-xl font-semibold text-foreground">غير مصرح بالوصول</h1>
        <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
          حسابك مسجّل الدخول، لكن ليست لديك صلاحية لعرض هذه الصفحة. يمكنك العودة إلى الأقسام المتاحة من القائمة الجانبية.
        </p>
      </div>
    </PageContainer>
  );
}
