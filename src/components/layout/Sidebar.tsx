import { NavLink } from "react-router-dom";
import { Building2, LogOut } from "lucide-react";
import { navigationItems } from "@/app/router/routes";
import { usePortfolioOccupancy } from "@/features/dashboard/usePortfolioOccupancy";
import { useAuth } from "@/features/auth/useAuth";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

type SidebarProps = {
  onNavigate?: () => void;
};

export function Sidebar({ onNavigate }: SidebarProps) {
  const { logout } = useAuth();
  const occupancy = usePortfolioOccupancy();

  return (
    <aside className="flex h-full w-sidebar flex-col border-l border-border bg-sidebar">
      <div className="flex h-header items-center gap-3 border-b border-border px-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <Building2 aria-hidden="true" className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="font-numeric text-[15px] font-bold leading-none text-foreground">Apex Realty OS</p>
          <p className="mt-1.5 truncate text-meta">نظام إدارة العقارات المطور</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">التنقل</p>
        <ul className="space-y-1.5">
          {navigationItems.map((item) => (
            <li key={item.key}>
              <NavLink
                className={({ isActive }) =>
                  cn(
                    "flex h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-medium text-sidebar-foreground transition-colors duration-fast hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive && "bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground",
                  )
                }
                to={item.href}
                onClick={onNavigate}
              >
                <item.icon aria-hidden="true" className="size-[18px] shrink-0" />
                <span className="min-w-0 truncate">{item.labelAr}</span>
                <span className="ms-auto shrink-0 font-numeric text-[10px] opacity-70">({item.labelEn})</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="space-y-3 border-t border-border p-4">
        <div className="flex items-center justify-between rounded-xl bg-primary-soft px-3.5 py-3">
          <div>
            <p className="text-meta">معدل الإشغال</p>
            <p className="mt-0.5 font-numeric text-sm font-bold text-primary">
              {occupancy === null ? "—" : formatPercent(occupancy)}
            </p>
          </div>
          <span className="size-2.5 rounded-full bg-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.16)]" />
        </div>
        <button
          className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
