import ProtectedLayout from "@/components/layouts/ProtectedLayout";

export default function BoardsLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
} 