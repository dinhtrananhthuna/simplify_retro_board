import { Suspense } from "react";
import StickerBoard from "./components/StickerBoard";

export default function BoardDetailPage({ params }: { params: { boardId: string } }) {
  return (
    <main className="max-w-5xl mx-auto py-10 px-4">
      <Suspense fallback={<div>Loading board...</div>}>
        <StickerBoard boardId={params.boardId} />
      </Suspense>
    </main>
  );
} 