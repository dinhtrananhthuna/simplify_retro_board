"use client";
// import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Shield, 
  Zap, 
  Heart,
  ChevronDown,
  Github,
  Mail,
  Building2
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const features = [
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Create a safe space for teams to discuss and share feedback effectively in retrospective sessions.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: MessageSquare,
    title: "Real-time Comments",
    description: "Engage in real-time interactions with comments, votes, and reactions for dynamic discussions.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: TrendingUp,
    title: "Continuous Improvement",
    description: "Track progress and action items to ensure teams continuously improve their work processes.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Team data is absolutely secure with robust authentication and authorization systems.",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized performance with Next.js 15 and real-time updates via WebSocket technology.",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: Heart,
    title: "Made with Love",
    description: "Developed with passion and dedication by the Simplify Dalat team.",
    color: "from-pink-500 to-rose-500"
  }
];

const stats = [
  { number: "100%", label: "Team Satisfaction", delay: 0.1 },
  { number: "∞", label: "Retrospectives", delay: 0.2 },
  { number: "24/7", label: "Availability", delay: 0.3 },
  { number: "🚀", label: "Innovation", delay: 0.4 }
];

export default function HomePage() {
  const { data: session } = useSession();
  // Removed scrollY as it's not used in current implementation

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 w-full z-50 backdrop-blur-md bg-black/40 border-b border-gray-800/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Retro Board</span>
          </motion.div>

          <div className="flex items-center space-x-4">
            {session ? (
              <Link href="/dashboard">
                <Button variant="default" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <div className="flex space-x-3">
                <Link href="/auth/signin">
                  <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800/50">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <Badge className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-300 border-blue-500/20 mb-4">
                <Building2 className="w-3 h-3 mr-1" />
                Internal Project - Simplify Dalat
              </Badge>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-100 via-white to-blue-100 bg-clip-text text-transparent mb-6"
            >
              Team Retrospective
              <br />
              <span className="text-blue-400">Reimagined</span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              A modern retrospective tool developed internally by{" "}
              <span className="text-blue-400 font-semibold"><a href="mailto:vudinh@simplifydalat.com">Vu Dinh</a></span>{" "}
              to enhance team collaboration efficiency and continuous improvement processes.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {!session ? (
                <>
                  <Link href="/auth/register">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 group"
                    >
                      Start Your Retrospective
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/auth/signin">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="border-gray-700 text-gray-300 hover:bg-gray-800/50 hover:text-white text-lg px-8 py-6"
                    >
                      Sign In
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/dashboard">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 group"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
            </motion.div>
          </motion.div>

          {/* Floating Animation */}
          <motion.div 
            className="mt-16"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-8 h-8 text-gray-600 mx-auto" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <motion.div 
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: stat.delay, type: "spring", stiffness: 200 }}
                  viewport={{ once: true }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-gray-500 text-sm md:text-base">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6">
              Powerful Features for
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Modern Teams</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Designed to optimize retrospective processes and enhance team collaboration workflows
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="bg-black/40 border-gray-800/50 backdrop-blur-sm hover:bg-black/60 transition-all duration-300 h-full group">
                  <CardContent className="p-6">
                    <motion.div 
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} p-3 mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <feature.icon className="w-full h-full text-white" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-gray-100 mb-3">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div 
            className="bg-gradient-to-r from-black/60 to-gray-900/40 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-gray-800/50"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="max-w-3xl mx-auto text-center">
              <motion.div 
                className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Building2 className="w-8 h-8 text-white" />
              </motion.div>
              
              <h3 className="text-3xl md:text-4xl font-bold text-gray-100 mb-6">
                Developed by Simplify Dalat
              </h3>
              
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                An internal project developed by{" "}
                <span className="text-blue-400 font-semibold"><a href="mailto:vudinh@simplifydalat.com">Vu Dinh</a></span>{" "}
                with the goal of creating a modern, efficient, and user-friendly retrospective tool for company teams.
                The application is built with cutting-edge technology to ensure optimal performance and excellent user experience.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="mailto:vudinh@simplifydalat.com"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Developer
                </motion.a>
                <motion.div
                  className="inline-flex items-center justify-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  <Github className="w-4 h-4 mr-2" />
                  Internal Project
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800/50">
        <div className="container mx-auto">
          <motion.div 
            className="flex flex-col md:flex-row items-center justify-between"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-100 font-semibold">Retro Board</span>
            </div>
            
            <div className="text-gray-500 text-sm text-center md:text-right">
              <p>© 2025 Simplify Dalat. Made with ❤️ in Dalat</p>
              <p className="mt-1">Developed by <a href="mailto:vudinh@simplifydalat.com">Vu Dinh</a></p>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
