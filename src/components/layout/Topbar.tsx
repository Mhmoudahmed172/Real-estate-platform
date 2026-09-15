import { Globe2, Menu, Plus } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SearchInput } from "@/components/forms/SearchInput";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/useAuth";

type TopbarProps = {
  onOpenSidebar: () => void;
};

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const displayName = user?.full_name ?? user?.email ?? "المستخدم";
  const roleLabel = user?.role?.name ?? (user?.is_superuser ? "superuser" : "حساب");
  const initial = displayName.trim().slice(0, 1) || "م";

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = query.trim();
    if (!nextQuery) return;
    navigate(`/properties?q=${encodeURIComponent(nextQuery)}`);
  }

  return (
    <header className="sticky top-0 z-30 flex h-header items-center gap-4 border-b border-border/80 bg-header/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <Button aria-label="فتح القائمة" className="lg:hidden" size="icon" variant="ghost" onClick={onOpenSidebar}>
        <Menu aria-hidden="true" className="size-5" />
      </Button>
      <form className="hidden min-w-0 flex-1 md:block" onSubmit={handleSearch}>
        <SearchInput
          className="max-w-2xl"
          placeholder="ابحث عن عقار، وحدة، عقد، أو مستأجر..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </form>
      <div className="ms-auto flex shrink-0 items-center gap-2.5">
        <div className="hidden h-10 items-center rounded-full border border-border bg-muted/80 p-1 lg:inline-flex" title="واجهة عربية ثابتة">
          <Globe2 aria-hidden="true" className="ms-1.5 size-3.5 text-muted-foreground" />
          <span className="rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm">العربية</span>
          <span className="px-2.5 py-1 text-[11px] font-medium text-muted-foreground">EN</span>
        </div>
        <Button aria-label="إضافة عقار" asChild className="rounded-full shadow-sm" size="icon">
          <Link to="/properties/new">
            <Plus aria-hidden="true" className="size-4" />
          </Link>
        </Button>
        <div className="flex min-w-0 items-center gap-2.5 rounded-full bg-muted/70 py-1 pe-3 ps-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {initial}
          </div>
          <div className="hidden min-w-0 max-w-[11rem] lg:max-w-[14rem] sm:block">
            <p className="truncate text-sm font-semibold leading-5 text-foreground" title={displayName}>
              {displayName}
            </p>
            <p className="truncate text-meta leading-4" title={roleLabel}>
              {roleLabel}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}


