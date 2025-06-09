"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useAppToast } from "@/hooks/useAppToast";
import Link from "next/link";
import { Users } from "lucide-react";

const passwordPolicy =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      passwordPolicy,
      "Password must contain uppercase, lowercase, number and special character"
    ),
});

type RegisterForm = z.infer<typeof registerSchema>;

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteBoard = searchParams?.get("inviteBoard");
  const toast = useAppToast();
  const [loading, setLoading] = useState(false);
  
  console.log("[Register] inviteBoard parameter:", inviteBoard);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Register successfully! Please sign in.");
      if (inviteBoard) {
        console.log("[Register] Redirecting to signin with inviteBoard:", inviteBoard);
        router.push(`/auth/signin?inviteBoard=${inviteBoard}`);
      } else {
        router.push("/auth/signin");
      }
    } else {
      const result = await res.json();
      toast.error(result.message || "Registration failed");
    }
    setLoading(false);
  };

  // Tạo signin URL với debugging
  const signinUrl = inviteBoard 
    ? `/auth/signin?inviteBoard=${inviteBoard}` 
    : "/auth/signin";
  
  console.log("[Register] Signin URL:", signinUrl);

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
            <CardTitle className="text-2xl font-bold text-gray-100">Create Account</CardTitle>
            {inviteBoard && (
              <p className="text-sm text-blue-400 mt-2">
                🎉 Join the retrospective board by creating your account
              </p>
            )}
            <p className="text-gray-400 mt-2">Start your retrospective journey</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                <Input 
                  id="name" 
                  type="text" 
                  {...register("name")} 
                  className="bg-gray-800/50 border-gray-700 text-gray-100 placeholder:text-gray-500"
                  placeholder="Enter your full name"
                />
                <div className="min-h-[24px]">
                  {errors.name && (
                    <div className="text-red-400 text-sm mt-1">{errors.name.message}</div>
                  )}
                </div>
              </div>
              
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
                  placeholder="Create a strong password"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Password must contain uppercase, lowercase, number and special character
                </div>
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
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <Link
                  href={signinUrl}
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Sign in here
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
} 