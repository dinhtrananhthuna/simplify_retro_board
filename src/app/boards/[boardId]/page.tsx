import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import StickerBoard from "./components/StickerBoard";

export default async function BoardDetailPage({ params }: { params: { boardId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin");
  }
  return <StickerBoard boardId={params.boardId} />;
} 