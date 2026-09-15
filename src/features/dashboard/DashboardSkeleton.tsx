import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/feedback/Skeleton";
import { Card, CardContent } from "@/components/ui/Card";

export function DashboardSkeleton() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2.5">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-36 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="flex min-h-[156px] flex-col justify-between pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-8 w-28" />
                </div>
                <Skeleton className="size-11 rounded-2xl" />
              </div>
              <Skeleton className="h-5 w-32 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="mb-5 h-5 w-56" />
            <Skeleton className="h-[280px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-5 pt-6">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 pt-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 pt-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
