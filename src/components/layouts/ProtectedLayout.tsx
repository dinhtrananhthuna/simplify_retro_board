"use client";

import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import TopBar from "@/components/TopBar";
// Đã fix lỗi import Footer (có thể thiếu file hoặc sai đường dẫn, nên kiểm tra lại đường dẫn đúng)
import Footer from "@/components/Footer";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
      <TopBar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster />
    </div>
  );
} 