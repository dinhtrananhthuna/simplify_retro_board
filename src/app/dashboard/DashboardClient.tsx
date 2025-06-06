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
  const [open, setOpen] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const toast = useAppToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BoardForm>({
    resolver: zodResolver(boardSchema),
  });

  // Fetch boards from API
  const fetchBoards = async () => {
    try {
      const res = await fetch("/api/boards");
      if (!res.ok) throw new Error("Failed to fetch boards");
      const data = await res.json();
      setBoards(data);
    } catch (e) {
      toast.error("Failed to load boards");
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
    } catch (e) {
      toast.error("Create board failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Retrospective Boards</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="default">New Board</Button>
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
      {boards.length === 0 ? (
        <div className="text-center text-muted-foreground py-20">
          You have no boards yet.<br />
          <span className="text-sm">Click "New Board" to create your first retrospective board.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {boards.map((board) => (
            <Card key={board.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>{board.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground mb-2">Created: {new Date(board.createdAt).toLocaleString()}</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">View</Button>
                  <Button size="sm" variant="secondary">Edit</Button>
                  <Button size="sm" variant="destructive">Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 