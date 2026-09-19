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
        "inline-flex shrink-0 items-center justify-center rounded-[10px] bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/15",
        size === "sm" ? "size-8" : "size-9",
        className,
      )}
    >
      <svg className={size === "sm" ? "size-4" : "size-[18px]"} fill="none" viewBox="0 0 24 24">
        <path
          d="M5 20V7.8C5 6.8 5.8 6 6.8 6h5.9c3.5 0 6.3 2.6 6.3 6s-2.8 6-6.3 6H9.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path
          d="M9.5 20V10h3.1c1.2 0 2.1.9 2.1 2s-.9 2-2.1 2H9.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path d="M7.7 9.8h1.8M7.7 13h1.8M7.7 16.2h1.8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    </span>
  );
}
