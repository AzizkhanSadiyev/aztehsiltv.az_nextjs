"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Menu, ChevronDown, User, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onMenuClick?: () => void;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string | null;
  };
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export function Topbar({ onMenuClick, user, isDark, onToggleTheme }: TopbarProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AU";

  return (
    <header className="admin-topbar">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="admin-topbar-btn lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="admin-topbar-search">
          <Search className="admin-topbar-search-icon" />
          <input type="text" placeholder="Search..." aria-label="Search" />
        </div>
      </div>

      {/* Right side */}
      <div className="admin-topbar-actions">
        {/* {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="admin-topbar-btn"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        )} */}

        {/* Account dropdown */}
        <div
          className={cn("admin-account-dropdown", dropdownOpen && "open")}
          ref={dropdownRef}
        >
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="admin-account-trigger"
          >
            <div className="admin-avatar">{initials}</div>
            <span className="admin-account-label">Account</span>
            <ChevronDown className="admin-account-chevron" />
          </button>

          <div className={cn("admin-dropdown-menu", dropdownOpen && "open")}>
            <div className="admin-dropdown-header">
              <p className="admin-dropdown-header-name">{user?.name || "Admin User"}</p>
              <p className="admin-dropdown-header-email">{user?.email || "admin@aztehsiltv.az"}</p>
            </div>
            <button
              onClick={() => {
                if (user?.id) {
                  router.push(`/admin/users/${user.id}`);
                } else {
                  router.push("/admin/users");
                }
                setDropdownOpen(false);
              }}
              className="admin-dropdown-item"
            >
              <User className="h-4 w-4" />
              Profile
            </button>
            <div className="admin-dropdown-divider" />
            <button
              onClick={() => signOut({ callbackUrl: "/admin/auth/login" })}
              className="admin-dropdown-item danger"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
