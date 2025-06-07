"use client";
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <TooltipPrimitive.Provider>{children}</TooltipPrimitive.Provider>;
}

function Tooltip({ children, ...props }: TooltipPrimitive.TooltipProps) {
  return <TooltipPrimitive.Root {...props}>{children}</TooltipPrimitive.Root>;
}

function TooltipTrigger({ children, ...props }: TooltipPrimitive.TooltipTriggerProps) {
  return <TooltipPrimitive.Trigger asChild {...props}>{children}</TooltipPrimitive.Trigger>;
}

function TooltipContent({ className, ...props }: TooltipPrimitive.TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={4}
        className={cn(
          "z-50 overflow-hidden rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white shadow-md animate-in fade-in-0",
          className
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent }; 