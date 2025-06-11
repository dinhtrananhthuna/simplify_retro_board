"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Users, Home, LogOut, User, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

export default function TopBar() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;

  return (
    <motion.header 
      className="w-full border-b bg-background/80 backdrop-blur-md sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        {/* Logo và Brand - giống homepage */}
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.05 }}
        >
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Retro Board</span>
          </Link>
        </motion.div>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          {/* Welcome text */}
          {user && (
            <span className="text-sm text-muted-foreground hidden sm:block">
              Welcome, {user.name || user.email}
            </span>
          )}

          {/* Navigation Links */}
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </Link>
          
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {user?.email?.[0].toUpperCase() || user?.name?.[0].toUpperCase()   || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {user?.name && (
                    <p className="font-medium">{user.name}</p>
                  )}
                  {user?.email && (
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </motion.header>
  );
} 