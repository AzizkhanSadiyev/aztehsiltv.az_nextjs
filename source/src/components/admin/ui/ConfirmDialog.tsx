"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const isProcessing = isLoading || loading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={() => !isProcessing && onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative z-50 w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl shadow-slate-900/10 border border-slate-200 animate-in fade-in-0 zoom-in-95">
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          disabled={isProcessing}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="p-7">
          {/* Icon */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className={cn(
                "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-2",
                variant === "danger" && "bg-red-50 text-red-600 border-red-200",
                variant === "warning" && "bg-amber-50 text-amber-600 border-amber-200",
                variant === "default" && "bg-blue-50 text-blue-600 border-blue-200"
              )}
            >
              {variant === "danger" ? (
                <Trash2 className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
              {description && (
                <p className="text-sm leading-relaxed text-slate-700">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
              className="border-slate-300 text-slate-800 hover:bg-slate-50"
            >
              {cancelLabel}
            </Button>
            <Button
              variant={variant === "danger" ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={isProcessing}
              className={cn(
                variant === "danger"
                  ? "bg-red-600 text-white text-slate-100 hover:bg-red-700"
                  : "bg-blue-600 text-white text-slate-100 hover:bg-blue-700"
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for easier usage
export function useConfirmDialog() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    description?: string;
    variant?: "danger" | "warning" | "default";
    onConfirm: () => void | Promise<void>;
  }>({
    open: false,
    title: "",
    onConfirm: () => {},
  });

  const confirm = (options: {
    title: string;
    description?: string;
    variant?: "danger" | "warning" | "default";
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title: options.title,
        description: options.description,
        variant: options.variant,
        onConfirm: () => resolve(true),
      });
    });
  };

  const close = () => {
    setState((prev) => ({ ...prev, open: false }));
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      open={state.open}
      onOpenChange={(open) => {
        if (!open) close();
      }}
      title={state.title}
      description={state.description}
      variant={state.variant}
      onConfirm={state.onConfirm}
    />
  );

  return { confirm, close, ConfirmDialog: ConfirmDialogComponent };
}

// Preset dialogs
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemName,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${itemName}?`}
      description={`This action cannot be undone. This will permanently delete the ${itemName.toLowerCase()} and remove all associated data.`}
      confirmLabel="Delete"
      variant="danger"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}

