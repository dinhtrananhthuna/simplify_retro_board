import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Retro Board",
  description: "Team Retrospective Board",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "bg-background text-foreground min-h-screen") + " dark"}>
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
