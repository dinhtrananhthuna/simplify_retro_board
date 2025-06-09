"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppToast } from "@/hooks/useAppToast";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
type LoginForm = z.infer<typeof loginSchema>;

function SignInPageContent() {
  const toast = useAppToast();
  const searchParams = useSearchParams();
  const inviteBoard = searchParams?.get("inviteBoard");
  const callbackUrl = searchParams?.get("callbackUrl");
  const [loading, setLoading] = useState(false);
  
  // Extract boardId từ callbackUrl nếu có (format: /boards/{boardId}/invite)
  let extractedBoardId = inviteBoard;
  if (!extractedBoardId && callbackUrl) {
    const decodedCallbackUrl = decodeURIComponent(callbackUrl);
    const boardIdMatch = decodedCallbackUrl.match(/\/boards\/([^\/]+)\/invite/);
    if (boardIdMatch) {
      extractedBoardId = boardIdMatch[1];
    }
  }
  
  console.log("[SignIn] inviteBoard parameter:", inviteBoard);
  console.log("[SignIn] callbackUrl:", callbackUrl);
  console.log("[SignIn] decoded callbackUrl:", callbackUrl ? decodeURIComponent(callbackUrl) : null);
  console.log("[SignIn] extractedBoardId:", extractedBoardId);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    const res = await signIn("credentials", {
      ...data,
      redirect: false,
    });
    if (res?.error) toast.error("Invalid email or password");
    else if (res?.ok) {
      toast.success("Login successful!");
      if (extractedBoardId) {
        console.log("[SignIn] Redirecting to invite board:", extractedBoardId);
        window.location.href = `/boards/${extractedBoardId}/invite`;
      } else if (callbackUrl) {
        console.log("[SignIn] Redirecting to callbackUrl:", callbackUrl);
        window.location.href = decodeURIComponent(callbackUrl);
      } else {
        window.location.href = "/dashboard";
      }
    }
    setLoading(false);
  };

  // Tạo register URL - ưu tiên inviteBoard param, fallback to extracted boardId
  const registerUrl = (inviteBoard || extractedBoardId)
    ? `/auth/register?inviteBoard=${inviteBoard || extractedBoardId}` 
    : "/auth/register";
  
  console.log("[SignIn] Register URL:", registerUrl);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-center">Sign In</CardTitle>
          {(inviteBoard || extractedBoardId) && (
            <p className="text-center text-sm text-muted-foreground">
              Bạn được mời tham gia board
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              <div className="min-h-[24px]">
                {errors.email && (
                  <div className="text-red-500 text-sm mt-1">{errors.email.message}</div>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              <div className="min-h-[24px]">
                {errors.password && (
                  <div className="text-red-500 text-sm mt-1">{errors.password.message}</div>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href={registerUrl}
              className="text-blue-500 hover:underline"
            >
              Register
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInPageContent />
    </Suspense>
  );
} 