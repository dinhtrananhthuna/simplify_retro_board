import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function BoardInvitePage({ params }: { params: { boardId: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect(`/boards/${params.boardId}`);
  } else {
    redirect(`/auth/signin?inviteBoard=${params.boardId}`);
  }
  return null;
} 