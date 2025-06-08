import StickerBoard from "./components/StickerBoard";

export default function BoardDetailPage({ params }: { params: { boardId: string } }) {
  return <StickerBoard boardId={params.boardId} />;
} 