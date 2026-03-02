"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";
import type { Session } from "next-auth";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/admin/ui/ToastProvider";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  session: Session;
}

export default function AdminLayoutClient({
  children,
  session,
}: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedCollapsed = localStorage.getItem("admin-sidebar-collapsed");
    if (savedCollapsed !== null) {
      setSidebarCollapsed(savedCollapsed === "true");
    }
    const savedTheme = localStorage.getItem("admin-theme");
    if (savedTheme) {
      setIsDark(savedTheme === "dark");
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("admin-sidebar-collapsed", String(sidebarCollapsed));
    }
  }, [sidebarCollapsed, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("admin-theme", isDark ? "dark" : "light");
    }
  }, [isDark, mounted]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const toggleSidebarCollapse = useCallback(() => setSidebarCollapsed((prev) => !prev), []);
  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), []);

  if (!mounted) {
    return (
      <div className="admin-layout">
        <div className="admin-sidebar" />
        <div className="admin-main">
          <div className="admin-topbar" />
          <div className="admin-content" />
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className={cn("admin-layout", isDark && "dark")}>
        <Sidebar
          collapsed={sidebarCollapsed}
          open={sidebarOpen}
          onToggleCollapse={toggleSidebarCollapse}
          onNavigate={() => setSidebarOpen(false)}
        />

        <div
          className={cn(
            "admin-mobile-overlay lg:hidden",
            sidebarOpen && "visible"
          )}
          onClick={() => setSidebarOpen(false)}
        />

        <div className={cn("admin-main", sidebarCollapsed && "sidebar-collapsed")}>
          <Topbar
            onMenuClick={toggleSidebar}
            user={session.user}
            isDark={isDark}
            onToggleTheme={toggleTheme}
          />
          <main className="admin-content">
            <div className="admin-content-container">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
