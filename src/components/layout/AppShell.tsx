import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:right-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:shadow-card"
        href="#main-content"
      >
        تخطي إلى المحتوى
      </a>
      <div className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:z-40 lg:block">
        <Sidebar />
      </div>
      <AnimatePresence>
        {sidebarOpen ? (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <button
              aria-label="إغلاق القائمة"
              className="absolute inset-0 bg-slate-950/35"
              type="button"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              className="absolute inset-y-0 right-0"
              initial={{ x: 272 }}
              animate={{ x: 0 }}
              exit={{ x: 272 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div className="lg:pr-sidebar">
        <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main id="main-content" className="bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.05),transparent_28rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
