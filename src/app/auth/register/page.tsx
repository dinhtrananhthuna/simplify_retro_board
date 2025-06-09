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
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-center">Register</CardTitle>
          {inviteBoard && (
            <p className="text-center text-sm text-muted-foreground">
              Tạo tài khoản để tham gia board
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" {...register("name")} />
              <div className="min-h-[24px]">
                {errors.name && (
                  <div className="text-red-500 text-sm mt-1">{errors.name.message}</div>
                )}
              </div>
            </div>
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
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href={signinUrl}
              className="text-blue-500 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
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