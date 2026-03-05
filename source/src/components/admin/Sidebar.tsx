"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderTree,
  Languages,
  Image,
  Users,
  Handshake,
  Video,
  Radio,
  Settings,
  ChevronLeft,
  X,
  FileText,
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  open?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/videos", label: "Videos", icon: Video },
  // { href: "/admin/broadcasts", label: "Broadcasts", icon: Radio },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/languages", label: "Languages", icon: Languages },
  { href: "/admin/translations", label: "Translations", icon: FileText },
  { href: "/admin/media", label: "Media", icon: Image },
  { href: "/admin/partners", label: "Partners", icon: Handshake },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ collapsed, open, onToggleCollapse, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const items = useMemo(
    () =>
      navItems.map((item) => ({
        ...item,
        badge: 0,
      })),
    [],
  );

  return (
    <aside
      className={cn(
        "admin-sidebar",
        collapsed && "collapsed",
        open && "open"
      )}
    >
      {/* Header */}
      <div className="admin-sidebar-header">
        <Link href="/admin" className="admin-sidebar-logo" onClick={onNavigate}>
          <img
            src="/assets/icons/logo.svg"
            alt="Aztehsil TV Logo"
            width={165}
            height={44}
          />
        </Link>
        {onNavigate && (
          <button
            onClick={onNavigate}
            className="admin-sidebar-collapse-btn lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="admin-sidebar-collapse-btn hidden lg:flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="admin-sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn("admin-nav-item", active && "active")}
            >
              <Icon className={cn("admin-nav-icon", collapsed && "mx-auto")} />
              <span className="admin-nav-label">{item.label}</span>
              {item.badge > 0 && (
                <span className="admin-nav-badge">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
