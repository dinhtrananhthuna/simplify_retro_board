import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold transition-colors",
        variant === "default"
          ? "bg-primary text-primary-foreground"
          : "bg-gray-200 text-gray-800",
        className
      )}
      {...props}
    />
  );
} 