"use client";

import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import TopBar from "@/components/TopBar";
// Đã fix lỗi import Footer (có thể thiếu file hoặc sai đường dẫn, nên kiểm tra lại đường dẫn đúng)
import Footer from "@/components/Footer";
import SessionProvider from "@/components/providers/SessionProvider";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <TopBar />
        <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
        <Footer />
        <Toaster />
      </div>
    </SessionProvider>
  );
} 