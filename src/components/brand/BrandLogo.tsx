import { BRAND_DESCRIPTOR_AR, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  variant?: "full" | "compact" | "mark";
  tone?: "default" | "inverse";
};

export function BrandLogo({
  className,
  imageClassName,
  variant = "compact",
  tone = "default",
}: BrandLogoProps) {
  if (variant === "full") {
    return (
      <img
        alt={`${BRAND_NAME} - ${BRAND_DESCRIPTOR_AR}`}
        className={cn("h-auto w-full object-contain", imageClassName, className)}
        src="/brand/sakanflow-logo.png"
      />
    );
  }

  if (variant === "mark") {
    return (
      <img
        alt={BRAND_NAME}
        className={cn("size-10 shrink-0 object-contain", imageClassName, className)}
        src="/brand/sakanflow-mark.png"
      />
    );
  }

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <img
        alt=""
        aria-hidden="true"
        className={cn("size-10 shrink-0 object-contain", imageClassName)}
        src="/brand/sakanflow-mark.png"
      />
      <div className="min-w-0 leading-none">
        <p
          className={cn(
            "truncate font-numeric text-lg font-extrabold text-navy",
            tone === "inverse" && "text-white",
          )}
          dir="ltr"
        >
          <span>Sakan</span>
          <span className={tone === "inverse" ? "text-white" : "text-primary"}>Flow</span>
        </p>
        <p
          className={cn(
            "mt-1 truncate text-[11px] font-semibold text-muted-foreground",
            tone === "inverse" && "text-white/75",
          )}
        >
          {BRAND_DESCRIPTOR_AR}
        </p>
      </div>
    </div>
  );
}
