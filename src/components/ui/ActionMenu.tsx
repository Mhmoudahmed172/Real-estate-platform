import { MoreHorizontal } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type ActionMenuItem = {
  id: string;
  label: string;
  onSelect?: () => void;
  href?: string;
  destructive?: boolean;
  disabled?: boolean;
};

type ActionMenuProps = {
  items: ActionMenuItem[];
  label?: string;
  className?: string;
};

export function ActionMenu({ items, label = "إجراءات", className }: ActionMenuProps) {
  const visibleItems = items.filter((item) => item.label);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function handlePointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  if (visibleItems.length === 0) return null;

  return (
    <div className={cn("relative", className)} ref={rootRef} onClick={(event) => event.stopPropagation()}>
      <Button
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="menu"
        className="rounded-full"
        type="button"
        variant="outline"
        onClick={() => setOpen((current) => !current)}
      >
        <MoreHorizontal aria-hidden="true" className="size-4" />
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">المزيد</span>
      </Button>
      {open ? (
        <div
          className="absolute end-0 z-30 mt-2 min-w-48 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-card"
          id={menuId}
          role="menu"
        >
          {visibleItems.map((item) => {
            const className = cn(
              "flex w-full items-center px-3 py-2 text-start text-sm transition-colors hover:bg-muted",
              item.destructive ? "text-destructive hover:bg-destructive/10" : "text-foreground",
              item.disabled && "pointer-events-none opacity-50",
            );
            if (item.href) {
              return (
                <Link className={className} key={item.id} role="menuitem" to={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              );
            }
            return (
              <button
                className={className}
                disabled={item.disabled}
                key={item.id}
                role="menuitem"
                type="button"
                onClick={() => {
                  setOpen(false);
                  item.onSelect?.();
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
