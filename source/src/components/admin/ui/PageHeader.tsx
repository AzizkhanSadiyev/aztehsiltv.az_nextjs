"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  children?: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  description,
  backHref,
  backLabel = "Back",
  children,
  className,
  actions,
}: PageHeaderProps) {
  return (
    <div className={cn("admin-page-header", className)}>
      <div className="admin-page-header-content">
        {/* Back link */}
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors text-black "
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        )}

        <h1 className="admin-page-title">{title}</h1>
        {description && (
          <p className="admin-page-subtitle">{description}</p>
        )}
      </div>

      {(actions || children) && (
        <div className="admin-page-actions">
          {actions}
          {children}
        </div>
      )}
    </div>
  );
}

// Common action buttons
interface CreateButtonProps {
  href?: string;
  onClick?: () => void;
  label?: string;
}

export function CreateButton({ href, onClick, label = "Create" }: CreateButtonProps) {
  const content = (
    <>
      <Plus className="h-4 w-4 mr-2" />
      {label}
    </>
  );

  if (href) {
    return (
      <Button asChild>
        <Link href={href}>{content}</Link>
      </Button>
    );
  }

  return <Button onClick={onClick}>{content}</Button>;
}

export function RefreshButton({
  onClick,
  isLoading,
}: {
  onClick: () => void;
  isLoading?: boolean;
}) {
  return (
    <Button variant="outline" size="icon" onClick={onClick} disabled={isLoading}>
      <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
      <span className="sr-only">Refresh</span>
    </Button>
  );
}

// Page container
export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      {children}
    </div>
  );
}

// Content card
export function ContentCard({
  children,
  className,
  title,
  description,
  actions,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className={cn("admin-card", className)}>
      {(title || description || actions) && (
        <div className="admin-card-header">
          <div>
            {title && <h3 className="admin-card-title">{title}</h3>}
            {description && (
              <p className="admin-card-subtitle">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="admin-card-body">{children}</div>
    </div>
  );
}
