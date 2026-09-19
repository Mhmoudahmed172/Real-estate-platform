import { BrandLogo } from "@/components/brand/BrandLogo";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  size?: "sm" | "md";
};

export function BrandMark({ className, size = "md" }: BrandMarkProps) {
  return (
    <BrandLogo
      className={cn(size === "sm" ? "size-8" : "size-9", className)}
      imageClassName="size-full"
      variant="mark"
    />
  );
}
