"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppToast } from "@/hooks/useAppToast";
import { Search, Plus, Trash2, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const boardSchema = z.object({
  title: z.string().min(2, "Board title must be at least 2 characters"),
});
type BoardForm = z.infer<typeof boardSchema>;

type Board = {
  id: string;
  title: string;
  createdAt: string;
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function DashboardClient() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editBoard, setEditBoard] = useState<Board | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const toast = useAppToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BoardForm>({
    resolver: zodResolver(boardSchema),
  });

  // Fetch boards from API
  const fetchBoards = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/boards");
      if (!res.ok) throw new Error("Failed to fetch boards");
      const data = await res.json();
      setBoards(data);
    } catch {
      toast.error("Failed to load boards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreateBoard = async (data: BoardForm) => {
    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const result = await res.json();
        toast.error(result.message || "Create board failed");
        return;
      }
      toast.success("Board created successfully!");
      setOpen(false);
      reset();
      fetchBoards();
    } catch {
      toast.error("Create board failed");
    }
  };

  const onEditBoard = async (data: BoardForm) => {
    if (!editBoard) return;
    try {
      const res = await fetch(`/api/boards/${editBoard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const result = await res.json();
        toast.error(result.message || "Update board failed");
        return;
      }
      toast.success("Board updated successfully!");
      setEditBoard(null);
      reset();
      fetchBoards();
    } catch {
      toast.error("Update board failed");
    }
  };

  const onDeleteBoard = async (boardId: string) => {
    if (!confirm("Are you sure you want to delete this board?")) return;
    try {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const result = await res.json();
        toast.error(result.message || "Delete board failed");
        return;
      }
      toast.success("Board deleted successfully!");
      fetchBoards();
    } catch {
      toast.error("Delete board failed");
    }
  };

  const filteredBoards = boards.filter((board) =>
    board.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (board: Board) => {
    setEditBoard(board);
    setValue("title", board.title);
  };

  return (
    <div className="container mx-auto px-6 py-10 pt-24">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="max-w-6xl mx-auto"
          >
            {/* Header */}
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-100 via-white to-blue-100 bg-clip-text text-transparent mb-2">
                    My Retrospective Boards
                  </h1>
                  <p className="text-gray-400">
                    Create and manage your team retrospective boards
                  </p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white gap-2">
                      <Plus className="w-4 h-4" /> New Board
                    </Button>
                  </DialogTrigger>
            <DialogContent className="bg-black/90 border-gray-800/50 backdrop-blur-sm">
              <DialogHeader>
                <DialogTitle className="text-gray-100">Create New Board</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onCreateBoard)} className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-gray-300">Board Title</Label>
                  <Input 
                    id="title" 
                    {...register("title")} 
                    className="bg-gray-800/50 border-gray-700 text-gray-100"
                  />
                  <div className="min-h-[24px]">
                    {errors.title && <span className="text-red-400 text-sm">{errors.title.message}</span>}
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full"
                >
                  {isSubmitting ? "Creating..." : "Create Board"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <Input
                  placeholder="Search boards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800/30 border-gray-700 text-gray-100 placeholder:text-gray-500"
                />
              </div>
            </div>

            {loading ? (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div key={i} variants={fadeInUp}>
                    <Card className="bg-black/40 border-gray-800/50 backdrop-blur-sm animate-pulse">
                      <CardHeader>
                        <div className="h-6 bg-gray-700/50 rounded w-3/4" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-4 bg-gray-700/50 rounded w-1/2 mb-4" />
                        <div className="flex gap-2">
                          <div className="h-8 bg-gray-700/50 rounded w-16" />
                          <div className="h-8 bg-gray-700/50 rounded w-16" />
                          <div className="h-8 bg-gray-700/50 rounded w-16" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : filteredBoards.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-100 mb-2">No boards found</h3>
                <p className="text-gray-400">
                  {searchQuery
                    ? "No boards match your search. Try a different search term."
                    : "Create your first retrospective board to get started!"}
                </p>
                {!searchQuery && (
                  <Button
                    variant="outline"
                    className="mt-4 gap-2 border-gray-700 text-gray-300 hover:bg-gray-800/50"
                    onClick={() => setOpen(true)}
                  >
                    <Plus className="w-4 h-4" /> Create New Board
                  </Button>
                )}
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                <motion.div
                  layout
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                >
                  {filteredBoards.map((board) => (
                    <motion.div
                      key={board.id}
                      layout
                      variants={fadeInUp}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="bg-black/40 border-gray-800/50 backdrop-blur-sm hover:bg-black/60 hover:shadow-lg transition-all duration-200 group">
                        <CardHeader>
                          <CardTitle className="truncate text-gray-100">{board.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xs text-gray-400 mb-4">
                            Created: {new Date(board.createdAt).toLocaleString()}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                              onClick={() => router.push(`/boards/${board.id}`)}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-700 text-gray-300 hover:bg-gray-800/50"
                              onClick={() => handleEditClick(board)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="bg-red-600/80 hover:bg-red-600"
                              onClick={() => onDeleteBoard(board.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            <Dialog open={!!editBoard} onOpenChange={() => setEditBoard(null)}>
              <DialogContent className="bg-black/90 border-gray-800/50 backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle className="text-gray-100">Edit Board</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onEditBoard)} className="space-y-4">
                  <div>
                    <Label htmlFor="edit-title" className="text-gray-300">Board Title</Label>
                    <Input 
                      id="edit-title" 
                      {...register("title")} 
                      className="bg-gray-800/50 border-gray-700 text-gray-100"
                    />
                    <div className="min-h-[24px]">
                      {errors.title && <span className="text-red-400 text-sm">{errors.title.message}</span>}
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full"
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
  );
} 