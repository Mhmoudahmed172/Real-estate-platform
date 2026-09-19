import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  size?: "sm" | "md";
};

export function BrandMark({ className, size = "md" }: BrandMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[10px] bg-primary-soft text-primary ring-1 ring-primary/10",
        size === "sm" ? "size-8" : "size-9",
        className,
      )}
    >
      <svg className={size === "sm" ? "size-4" : "size-[18px]"} fill="none" viewBox="0 0 24 24">
        <path
          d="M4.5 19.5V10.2L12 4.5l7.5 5.7v9.3"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.75"
        />
        <path d="M9.5 19.5v-5h5v5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
        <path d="M9.5 10.5h5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" />
      </svg>
    </span>
  );
}
