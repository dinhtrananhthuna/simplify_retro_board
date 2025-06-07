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
import { useRouter, useSearchParams } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function SignInPage() {
  const toast = useAppToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteBoard = searchParams.get("inviteBoard");
  const [loading, setLoading] = useState(false);
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
      if (inviteBoard) {
        window.location.href = `/boards/${inviteBoard}/invite`;
      } else {
        window.location.href = "/dashboard";
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-center">Sign In</CardTitle>
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
            Don't have an account?{' '}
            <a
              href={inviteBoard ? `/auth/register?inviteBoard=${inviteBoard}` : "/auth/register"}
              className="text-blue-500 hover:underline"
            >
              Register
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 