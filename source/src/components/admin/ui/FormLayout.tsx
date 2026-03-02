"use client";

import { ReactNode, FormEvent } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormLayoutProps {
  children: ReactNode;
  onSubmit: (e: FormEvent) => void | Promise<void>;
  className?: string;
}

export function FormLayout({ children, onSubmit, className }: FormLayoutProps) {
  return (
    <form onSubmit={onSubmit} className={cn("space-y-6", className)}>
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
    <div className={cn("bg-card rounded-lg border p-6", className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-base font-semibold text-black">{title}</h3>}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-5">{children}</div>
    </div>
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
    <div className={cn("space-y-4", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-slate-600">{hint}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
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
        "sticky bottom-0 -mx-6 -mb-6 px-6 py-4 bg-background/95 backdrop-blur border-t flex items-center justify-end gap-3",
        className
      )}
    >
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {cancelLabel}
        </Button>
      )}
      <Button type="submit" disabled={isSubmitting || isDisabled}>
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
        "admin-input flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
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
        "admin-textarea flex min-h-[96px] w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
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
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        checked
          ? "bg-[#c7d7a0] border-[#b9cb8c] shadow-[0_6px_16px_rgba(152,179,92,0.35)]"
          : "bg-slate-200 border-slate-300",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-[0_4px_10px_rgba(0,0,0,0.12)] ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}
