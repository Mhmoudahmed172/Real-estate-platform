import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { navigationItems } from "@/app/router/routes";
import { usePortfolioOccupancy } from "@/features/dashboard/usePortfolioOccupancy";
import { useAuth } from "@/features/auth/useAuth";
import { useAuthorization } from "@/features/auth/useAuthorization";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

type SidebarProps = {
  onNavigate?: () => void;
};

export function Sidebar({ onNavigate }: SidebarProps) {
  const { logout } = useAuth();
  const { can } = useAuthorization();
  const occupancy = usePortfolioOccupancy();
  const visibleItems = navigationItems.filter((item) => can(item.permission));

  return (
    <aside className="flex h-full w-sidebar flex-col border-l border-border bg-sidebar shadow-[0_18px_45px_rgb(23_34_53_/_0.06)]">
      <div className="flex h-header items-center border-b border-border px-4">
        <BrandLockup compact />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[11px] font-bold text-muted-foreground">التنقل</p>
        <ul className="space-y-1.5">
          {visibleItems.map((item) => (
            <li key={item.key}>
              <NavLink
                className={({ isActive }) =>
                  cn(
                    "flex h-10 items-center gap-3 rounded-[10px] px-3 text-[13px] font-medium text-sidebar-foreground transition-colors duration-fast hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive && "bg-primary-soft font-bold text-primary shadow-sm hover:bg-primary-soft hover:text-primary",
                  )
                }
                to={item.href}
                onClick={onNavigate}
              >
                <item.icon aria-hidden="true" className="size-[18px] shrink-0" />
                <span className="min-w-0 truncate">{item.labelAr}</span>
                <span className="ms-auto shrink-0 font-numeric text-[10px] text-muted-foreground">{item.labelEn}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="space-y-3 border-t border-border p-4">
        <div className="flex items-center justify-between rounded-[10px] border border-border bg-card px-3.5 py-3 shadow-sm">
          <div>
            <p className="text-meta">معدل الإشغال</p>
            <p className="mt-0.5 font-numeric text-sm font-semibold text-foreground">
              {occupancy === null ? "—" : formatPercent(occupancy)}
            </p>
          </div>
          <span className="size-2 rounded-full bg-primary" />
        </div>
        <button
          className="flex h-10 w-full items-center gap-2 rounded-[10px] px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          type="button"
          onClick={() => void logout()}
        >
          <LogOut aria-hidden="true" className="size-4" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
