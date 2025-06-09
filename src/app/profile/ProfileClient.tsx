"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppToast } from "@/hooks/useAppToast";
import { User, Lock, Mail, Calendar, Shield } from "lucide-react";
import { motion } from "framer-motion";
import TopBar from "@/components/TopBar";

interface ProfileClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function ProfileClient({ user }: ProfileClientProps) {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const toast = useAppToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmitPassword = async (data: PasswordForm) => {
    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Failed to update password");
        return;
      }

      toast.success("Password updated successfully!");
      reset();
      setIsChangingPassword(false);
    } catch (error) {
      toast.error("Failed to update password");
    }
  };

  return (
    <>
      <TopBar />
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
        <div className="container mx-auto px-6 py-10 pt-24">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-100 via-white to-blue-100 bg-clip-text text-transparent mb-2">
                Profile Settings
              </h1>
              <p className="text-gray-400">
                Manage your account information and security settings
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* User Information Card */}
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-black/40 border-gray-800/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-100">
                      <User className="w-5 h-5" />
                      User Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-100">
                          {user.name || "No name set"}
                        </h3>
                        <p className="text-gray-400">{user.email}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                        <Mail className="w-4 h-4 text-blue-400" />
                        <div>
                          <Label className="text-sm text-gray-300">Email</Label>
                          <p className="text-gray-100">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <div>
                          <Label className="text-sm text-gray-300">Member since</Label>
                          <p className="text-gray-100">Account created</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                        <Shield className="w-4 h-4 text-green-400" />
                        <div>
                          <Label className="text-sm text-gray-300">Account Status</Label>
                          <p className="text-green-400">Active</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Password Security Card */}
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-black/40 border-gray-800/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-100">
                      <Lock className="w-5 h-5" />
                      Security Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!isChangingPassword ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-800/30 rounded-lg">
                          <h4 className="font-medium text-gray-100 mb-2">Password</h4>
                          <p className="text-gray-400 text-sm mb-4">
                            Keep your account secure with a strong password
                          </p>
                          <Button
                            onClick={() => setIsChangingPassword(true)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            Change Password
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
                        <div>
                          <Label htmlFor="currentPassword" className="text-gray-300">
                            Current Password
                          </Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            {...register("currentPassword")}
                            className="bg-gray-800/50 border-gray-700 text-gray-100"
                          />
                          {errors.currentPassword && (
                            <p className="text-red-400 text-sm mt-1">
                              {errors.currentPassword.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="newPassword" className="text-gray-300">
                            New Password
                          </Label>
                          <Input
                            id="newPassword"
                            type="password"
                            {...register("newPassword")}
                            className="bg-gray-800/50 border-gray-700 text-gray-100"
                          />
                          {errors.newPassword && (
                            <p className="text-red-400 text-sm mt-1">
                              {errors.newPassword.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="confirmPassword" className="text-gray-300">
                            Confirm New Password
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            {...register("confirmPassword")}
                            className="bg-gray-800/50 border-gray-700 text-gray-100"
                          />
                          {errors.confirmPassword && (
                            <p className="text-red-400 text-sm mt-1">
                              {errors.confirmPassword.message}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            {isSubmitting ? "Updating..." : "Update Password"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsChangingPassword(false);
                              reset();
                            }}
                            className="border-gray-700 text-gray-300 hover:bg-gray-800/50"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Additional Info */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <Card className="bg-black/40 border-gray-800/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-100 mb-2">
                      Need help with your account?
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Contact our support team for assistance with your profile or security settings.
                    </p>
                    <Button
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800/50"
                      onClick={() => window.open('mailto:vudinh@simplifydalat.com')}
                    >
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
} 