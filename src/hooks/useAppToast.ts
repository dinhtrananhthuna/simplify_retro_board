import { toast } from "sonner";
import { useMemo } from "react";

export function useAppToast() {
  return useMemo(() => ({
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    info: (message: string) => toast(message),
    warning: (message: string) => toast.warning(message),
  }), []);
} 