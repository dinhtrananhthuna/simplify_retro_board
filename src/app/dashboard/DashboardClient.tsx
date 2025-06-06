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
import { Search, Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const boardSchema = z.object({
  name: z.string().min(2, "Board name must be at least 2 characters"),
});
type BoardForm = z.infer<typeof boardSchema>;

type Board = {
  id: string;
  name: string;
  createdAt: string;
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
    } catch (e) {
      toast.error("Failed to load boards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
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
    } catch (e) {
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
    } catch (e) {
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
    } catch (e) {
      toast.error("Delete board failed");
    }
  };

  const filteredBoards = boards.filter((board) =>
    board.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (board: Board) => {
    setEditBoard(board);
    setValue("name", board.name);
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Retrospective Boards</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="gap-2">
                <Plus className="w-4 h-4" /> New Board
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Board</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onCreateBoard)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Board Name</Label>
                  <Input id="name" {...register("name")} />
                  <div className="min-h-[24px]">
                    {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
                  </div>
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Creating..." : "Create Board"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search boards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-1/2 mb-4" />
                <div className="flex gap-2">
                  <div className="h-8 bg-muted rounded w-16" />
                  <div className="h-8 bg-muted rounded w-16" />
                  <div className="h-8 bg-muted rounded w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredBoards.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold mb-2">No boards found</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? "No boards match your search. Try a different search term."
              : "Create your first retrospective board to get started!"}
          </p>
          {!searchQuery && (
            <Button
              variant="outline"
              className="mt-4 gap-2"
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
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          >
            {filteredBoards.map((board) => (
              <motion.div
                key={board.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <CardTitle className="truncate">{board.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground mb-4">
                      Created: {new Date(board.createdAt).toLocaleString()}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/boards/${board.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEditClick(board)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Board</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onEditBoard)} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Board Name</Label>
              <Input id="edit-name" {...register("name")} />
              <div className="min-h-[24px]">
                {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 