"use client";

import { ReactNode, FormEvent } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormLayoutProps {
  children: ReactNode;
  onSubmit: (e: FormEvent) => void | Promise<void>;
  className?: string;
  id?: string;
}

export function FormLayout({ children, onSubmit, className, id }: FormLayoutProps) {
  return (
    <form id={id} onSubmit={onSubmit} className={cn("admin-form", className)}>
      {children}
    </form>
  );
}

// Two-column layout for forms
interface FormGridProps {
  children: ReactNode;
  className?: string;
}

export function FormGrid({ children, className }: FormGridProps) {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6", className)}>
      {children}
    </div>
  );
}

// Main content area (2/3 width on large screens)
export function FormMain({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("lg:col-span-2 space-y-6", className)}>
      {children}
    </div>
  );
}

// Sidebar area (1/3 width on large screens)
export function FormSidebar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {children}
    </div>
  );
}

// Form section with title
interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <section className={cn("admin-form-section", className)}>
      {(title || description) && (
        <div className="admin-form-section-header">
          {title && <h3 className="admin-form-section-title">{title}</h3>}
          {description && (
            <p className="admin-form-section-description">{description}</p>
          )}
        </div>
      )}
      <div className="admin-form-section-body">{children}</div>
    </section>
  );
}

// Form field wrapper
interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("admin-form-field", className)}>
      <label
        htmlFor={htmlFor}
        className="admin-form-label text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="admin-form-hint text-xs text-slate-600">{hint}</p>
      )}
      {error && <p className="admin-form-error text-xs text-destructive">{error}</p>}
    </div>
  );
}

// Sticky action bar for forms
interface FormActionsProps {
  onCancel?: () => void;
  cancelLabel?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export function FormActions({
  onCancel,
  cancelLabel = "Cancel",
  submitLabel = "Save",
  isSubmitting = false,
  isDisabled = false,
  className,
}: FormActionsProps) {
  return (
    <div
      className={cn(
        "admin-form-actions flex items-center justify-end gap-2",
        className
      )}
    >
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          className="admin-action-cancel"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {cancelLabel}
        </Button>
      )}
      <Button
        type="submit"
        className="admin-action-save"
        disabled={isSubmitting || isDisabled}
      >
        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {submitLabel}
      </Button>
    </div>
  );
}

// Input components
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "admin-input flex w-full rounded-lg border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-destructive focus-visible:ring-destructive",
        className
      )}
      {...props}
    />
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "admin-textarea flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-destructive focus-visible:ring-destructive",
        className
      )}
      {...props}
    />
  );
}

// Switch component
interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked, onCheckedChange, disabled, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "admin-switch",
        checked && "is-checked",
        className
      )}
    >
      <span
        className={cn(
          "admin-switch-thumb",
          checked && "is-checked"
        )}
      />
    </button>
  );
}
