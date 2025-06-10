'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import StickerBoard from "./StickerBoard";

interface StickerBoardClientProps {
  boardId: string;
}

export default function StickerBoardClient({ boardId }: StickerBoardClientProps) {
  console.log('[StickerBoardClient] Rendering with:', { boardId });
  
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log('[StickerBoardClient] Mounted');
    setMounted(true);
  }, []);

  // Loading state cho session và hydration
  if (!mounted || status === "loading") {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="space-y-2">
                  <div className="h-20 bg-gray-200 rounded w-full"></div>
                  <div className="h-16 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Redirect được handle ở server level
  if (!session?.user) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Authentication required</p>
      </div>
    );
  }

  console.log('[StickerBoardClient] Rendering with session:', !!session?.user?.email, 'boardId:', boardId);

  return <StickerBoard boardId={boardId} />;
} 