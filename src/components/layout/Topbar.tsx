import { Menu, Plus } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SearchInput } from "@/components/forms/SearchInput";
import { Button } from "@/components/ui/Button";
import { Can } from "@/app/guards/Can";
import { navigationItems } from "@/app/router/routes";
import { useAuth } from "@/features/auth/useAuth";
import { BRAND_NAME } from "@/lib/brand";
import { roleDisplayLabel } from "@/lib/labels";

type TopbarProps = {
  onOpenSidebar: () => void;
};

function currentPageTitle(pathname: string) {
  const match = navigationItems
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((left, right) => right.href.length - left.href.length)[0];
  return match?.label ?? BRAND_NAME;
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const displayName = user?.full_name ?? user?.email ?? "المستخدم";
  const roleLabel = roleDisplayLabel(user?.role?.name, Boolean(user?.is_superuser));
  const initial = displayName.trim().slice(0, 1) || "م";
  const pageTitle = currentPageTitle(location.pathname);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = query.trim();
    if (!nextQuery) return;
    navigate(`/properties?q=${encodeURIComponent(nextQuery)}`);
  }

  return (
    <header className="sticky top-0 z-30 flex h-header items-center gap-3 border-b border-border bg-header/95 px-4 shadow-[0_1px_0_rgb(221_229_227),0_10px_28px_rgb(23_34_53_/_0.05)] backdrop-blur sm:gap-4 sm:px-6 lg:px-8">
      <Button aria-label="فتح القائمة" className="lg:hidden" size="icon" variant="ghost" onClick={onOpenSidebar}>
        <Menu aria-hidden="true" className="size-5" />
      </Button>
      <div className="min-w-0">
        <p className="truncate text-base font-bold text-navy">{pageTitle}</p>
      </div>
      <form className="hidden min-w-0 flex-1 md:block" onSubmit={handleSearch}>
        <SearchInput
          className="mx-auto max-w-xl"
          placeholder="ابحث عن عقار، وحدة، عقد، أو مستأجر..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </form>
      <div className="ms-auto flex shrink-0 items-center gap-2">
        <Can permission="properties.create">
          <Button aria-label="إضافة عقار" asChild size="icon" variant="outline">
            <Link to="/properties/new">
              <Plus aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </Can>
        <div className="flex min-w-0 items-center gap-2 rounded-full border border-border bg-card py-1 pe-3 ps-1 shadow-sm">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
            {initial}
          </div>
          <div className="hidden min-w-0 max-w-[11rem] sm:block lg:max-w-[14rem]">
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
