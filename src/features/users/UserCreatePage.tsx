import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { UserForm } from "@/features/users/UserForm";
import { useRolesList, useUserMutations } from "@/features/users/useUsers";
import { pageMotion } from "@/lib/motion";
import type { UserCreate } from "@/types/auth";

export function UserCreatePage() {
  const navigate = useNavigate();
  const rolesQuery = useRolesList();
  const { createMutation } = useUserMutations();

  async function submit(payload: UserCreate) {
    const user = await createMutation.mutateAsync(payload);
    navigate(`/users/${user.id}/edit`);
  }

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <PageHeader eyebrow="المستخدمون" title="إضافة مستخدم" description="إنشاء مستخدم حسب مخطط UserCreate، مع اختيار الدور من /users/roles." />
        {rolesQuery.isError ? <ErrorState title="تعذر تحميل الأدوار" description="لا يمكن إنشاء مستخدم قبل تحميل قائمة الأدوار من الخادم." onRetry={() => void rolesQuery.refetch()} /> : <UserForm mode="create" roles={rolesQuery.data ?? []} rolesLoading={rolesQuery.isPending} onSubmit={(payload) => submit(payload as UserCreate)} onCancelHref="/users" />}
      </PageContainer>
    </motion.div>
  );
}
