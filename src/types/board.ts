export interface Vote {
  id: string;
  stickerId: string;
  email: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  stickerId: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sticker {
  id: string;
  content: string;
  stickerType: string;
  x: number;
  y: number;
  position: number;
  boardId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  votes?: Vote[];
  comments?: Comment[];
}

export interface BoardMember {
  id: string;
  email: string;
  role: string;
  boardId: string;
  createdAt: Date;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  members?: BoardMember[];
}

export interface PresenceMember {
  email: string;
  role: string;
  online: boolean;
} 