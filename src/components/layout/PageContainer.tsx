import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type PageContainerProps = PropsWithChildren<{
  className?: string;
}>;

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("mx-auto flex w-full max-w-[1440px] flex-col gap-6 p-4 sm:p-6 lg:px-8 lg:py-7", className)}>
      {children}
    </div>
  );
}
