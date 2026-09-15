import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export function SearchInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
      <Input
        className="h-11 min-h-11 rounded-full border-transparent bg-muted/90 pr-11 text-sm shadow-none placeholder:text-muted-foreground/80 focus-visible:bg-card focus-visible:ring-primary/30"
        type="search"
        {...props}
      />
    </div>
  );
}
