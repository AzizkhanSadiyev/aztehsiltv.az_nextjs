"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaLabel?: string;
  trend?: "positive" | "negative";
  icon?: LucideIcon;
  highlight?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  trend = "positive",
  icon: Icon,
  highlight = false,
  className,
}: StatCardProps) {
  return (
    <div className={cn("admin-stat-card", highlight && "highlight", className)}>
      <div className="admin-stat-header">
        <span className="admin-stat-label">{label}</span>
        {Icon && <Icon className="admin-stat-icon" />}
      </div>
      <div className="admin-stat-value">{value}</div>
      {(delta || deltaLabel) && (
        <div className={cn("admin-stat-change", trend === "negative" ? "negative" : "positive")}>
          {delta && <span>{delta}</span>}
          {deltaLabel && <span>{deltaLabel}</span>}
        </div>
      )}
    </div>
  );
}

interface SectionCardProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
}: SectionCardProps) {
  return (
    <div className={cn("admin-section-card", className)}>
      {(title || description || actions) && (
        <div className="admin-section-header">
          <div>
            {title && <h3 className="admin-section-title">{title}</h3>}
            {description && (
              <p className="admin-card-subtitle">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="admin-section-body">{children}</div>
    </div>
  );
}
