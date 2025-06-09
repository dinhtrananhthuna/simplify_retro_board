"use client";
import { Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function BrandNav() {
  const { data: session } = useSession();

  return (
    <motion.nav 
      className="brand-nav fixed top-0 w-full z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.05 }}
        >
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Retro Board</span>
          </Link>
        </motion.div>

        <div className="flex items-center space-x-4">
          {session ? (
            <div className="flex items-center space-x-3">
              <span className="text-gray-300 text-sm">
                Welcome, {session.user?.name || session.user?.email}
              </span>
              <Link href="/dashboard">
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800/50">
                  Dashboard
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-gray-300 hover:text-white hover:bg-gray-800/50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex space-x-3">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800/50">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="brand-button-primary text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
} 