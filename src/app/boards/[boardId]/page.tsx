import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import StickerBoardClient from "./components/StickerBoardClient";

export default async function BoardDetailPage({ params }: { params: Promise<{ boardId: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin");
  }
  return <StickerBoardClient boardId={resolvedParams.boardId} />;
} 