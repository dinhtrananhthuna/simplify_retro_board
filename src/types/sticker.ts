import { Sticker, Vote, Comment, User } from '@prisma/client';

export type { User };

export type StickerWithRelations = Sticker & {
  votes: Vote[];
  comments: Comment[];
};

export type CreateStickerData = {
  content: string;
  stickerType: string;
  position: number;
};

export type UpdateStickerData = {
  content?: string;
  stickerType?: string;
  position?: number;
  x?: number;
  y?: number;
};

export type StickerBoardProps = {
  stickers: StickerWithRelations[];
  currentUser: User;
  userRole: string;
  onStickerCreate: (data: CreateStickerData) => void;
  onStickerUpdate: (id: string, data: UpdateStickerData) => void;
  onStickerDelete: (id: string) => void;
  onStickerMove: (id: string, position: number) => void;
  onVote: (stickerId: string) => void;
  onComment: (stickerId: string, content: string) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}; 