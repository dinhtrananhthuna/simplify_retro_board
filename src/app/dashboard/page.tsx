import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin");
  }
  return <DashboardClient />;
} 