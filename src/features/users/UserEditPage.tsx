import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { UserForm } from "@/features/users/UserForm";
import { AuditLogSection } from "@/components/layout/AuditLogSection";
import { useRolesList, useUser, useUserMutations } from "@/features/users/useUsers";
import { pageMotion } from "@/lib/motion";
import type { UserUpdate } from "@/types/auth";

export function UserEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = id ? Number(id) : undefined;
  const userQuery = useUser(userId);
  const rolesQuery = useRolesList();
  const { updateMutation } = useUserMutations();

  async function submit(payload: UserUpdate) {
    if (!userId) return;
    await updateMutation.mutateAsync({ id: userId, payload });
    navigate("/users");
  }

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <PageHeader eyebrow="المستخدمون" title="تعديل مستخدم" description="تعديل بيانات المستخدم وتعيين الدور من الأدوار المعرفة في النظام." />
        {userQuery.isPending || rolesQuery.isPending ? (
          <LoadingState label="جاري تحميل المستخدم" />
        ) : userQuery.isError || !userQuery.data ? (
          <ErrorState title="تعذر تحميل المستخدم" description="لا يمكن فتح نموذج التعديل لهذا المستخدم." onRetry={() => void userQuery.refetch()} />
        ) : rolesQuery.isError ? (
          <ErrorState title="تعذر تحميل الأدوار" description="لا يمكن تعديل الدور قبل تحميل قائمة الأدوار." onRetry={() => void rolesQuery.refetch()} />
        ) : (
          <>
            <UserForm mode="edit" user={userQuery.data} roles={rolesQuery.data ?? []} onSubmit={submit} onCancelHref="/users" />
            <AuditLogSection entityId={userQuery.data.id} entityType="user" />
          </>
        )}
      </PageContainer>
    </motion.div>
  );
}
