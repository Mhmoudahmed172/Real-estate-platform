import { BrandLogo } from "@/components/brand/BrandLogo";
import { cn } from "@/lib/utils";

type BrandLockupProps = {
  className?: string;
  compact?: boolean;
  align?: "start" | "center";
};

export function BrandLockup({ className, compact = false, align = "start" }: BrandLockupProps) {
  return (
    <BrandLogo
      className={cn(
        compact && "[&_img]:size-8 [&_p:first-of-type]:text-base",
        align === "center" && "justify-center",
        className,
      )}
      variant="compact"
    />
  );
}
