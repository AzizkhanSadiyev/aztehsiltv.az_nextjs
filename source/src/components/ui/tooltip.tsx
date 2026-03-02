"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Simple tooltip provider without Radix UI
const TooltipProvider = ({ children, ...props }: { children: React.ReactNode, delayDuration?: number }) => {
  return <>{children}</>
}

// Simple tooltip component without Radix UI
const Tooltip = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

// Simple tooltip trigger without Radix UI
const TooltipTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, asChild = false, children, ...props }, ref) => {
  if (asChild) {
    return <>{children}</>
  }
  return (
    <button
      ref={ref}
      className={cn("", className)}
      {...props}
    >
      {children}
    </button>
  )
})
TooltipTrigger.displayName = "TooltipTrigger"

// Simple tooltip content without Radix UI
const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { sideOffset?: number, side?: "top" | "right" | "bottom" | "left" }
>(({ className, sideOffset = 4, side = "top", children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }