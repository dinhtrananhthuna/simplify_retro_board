export default function StickerCard({ sticker }: { sticker: any }) {
  return (
    <div className="bg-white rounded shadow p-2 text-sm flex flex-col gap-1">
      <div>{sticker.content}</div>
      <div className="text-xs text-muted-foreground flex justify-between mt-1">
        <span>{sticker.createdBy}</span>
        <span>{new Date(sticker.createdAt).toLocaleString()}</span>
      </div>
    </div>
  );
} 