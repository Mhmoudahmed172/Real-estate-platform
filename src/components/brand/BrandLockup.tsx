import { BrandMark } from "@/components/brand/BrandMark";
import { BRAND_DESCRIPTOR_AR, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

type BrandLockupProps = {
  className?: string;
  compact?: boolean;
  align?: "start" | "center";
};

export function BrandLockup({ className, compact = false, align = "start" }: BrandLockupProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", align === "center" && "justify-center", className)}>
      <BrandMark size={compact ? "sm" : "md"} />
      <div className={cn("min-w-0", align === "center" && "text-center")}>
        <p className={cn("truncate font-semibold leading-none text-foreground", compact ? "text-[13px]" : "text-sm")}>
          {BRAND_NAME}
        </p>
        <p className="mt-1 truncate text-[11px] leading-none text-muted-foreground">{BRAND_DESCRIPTOR_AR}</p>
      </div>
    </div>
  );
}
