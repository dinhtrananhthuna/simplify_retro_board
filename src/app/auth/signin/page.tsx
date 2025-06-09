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
import { Users } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo và Brand */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Retro Board</span>
          </div>
        </div>

        <Card className="bg-black/40 border-gray-800/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-100">Welcome Back</CardTitle>
            {(inviteBoard || extractedBoardId) && (
              <p className="text-sm text-blue-400 mt-2">
                🎉 You&apos;re invited to join a retrospective board
              </p>
            )}
            <p className="text-gray-400 mt-2">Sign in to continue your journey</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  {...register("email")} 
                  className="bg-gray-800/50 border-gray-700 text-gray-100 placeholder:text-gray-500"
                  placeholder="Enter your email"
                />
                <div className="min-h-[24px]">
                  {errors.email && (
                    <div className="text-red-400 text-sm mt-1">{errors.email.message}</div>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  {...register("password")} 
                  className="bg-gray-800/50 border-gray-700 text-gray-100 placeholder:text-gray-500"
                  placeholder="Enter your password"
                />
                <div className="min-h-[24px]">
                  {errors.password && (
                    <div className="text-red-400 text-sm mt-1">{errors.password.message}</div>
                  )}
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3" 
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Don&apos;t have an account?{' '}
                <Link
                  href={registerUrl}
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Create account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Retro Board - Made with ❤️ in Dalat
        </div>
      </div>
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