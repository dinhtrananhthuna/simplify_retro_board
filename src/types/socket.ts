import { Sticker } from '@prisma/client';

export interface ServerToClientEvents {
  // Presence events
  'presence:joined': (data: { email: string; role: string }) => void;
  'presence:left': (data: { email: string }) => void;
  'presence:list': (data: { members: Array<{ email: string; role: string; online: boolean }> }) => void;
  
  // Sticker events
  'sticker:created': (data: Sticker) => void;
  'sticker:updated': (data: Sticker) => void;
  'sticker:deleted': (data: { id: string }) => void;
  'sticker:moved': (data: { id: string; x: number; y: number; position: number }) => void;
  
  // Vote events
  'vote:added': (data: { stickerId: string; email: string }) => void;
  'vote:removed': (data: { stickerId: string; email: string }) => void;
  
  // Comment events
  'comment:added': (data: Comment) => void;
  'comment:updated': (data: Comment) => void;
  'comment:deleted': (data: { id: string }) => void;
}

export interface ClientToServerEvents {
  // Presence events
  'presence:join': (data: { boardId: string; email?: string }) => void;
  'presence:leave': (data: { boardId: string }) => void;
  
  // Sticker events
  'sticker:create': (data: { content: string; stickerType: string; boardId: string; x?: number; y?: number }) => void;
  'sticker:update': (data: { id: string; content: string }) => void;
  'sticker:delete': (data: { id: string }) => void;
  'sticker:move': (data: { id: string; x: number; y: number; position: number }) => void;
  
  // Vote events
  'vote:add': (data: { stickerId: string }) => void;
  'vote:remove': (data: { stickerId: string }) => void;
  
  // Comment events
  'comment:add': (data: { stickerId: string; content: string }) => void;
  'comment:update': (data: { id: string; content: string }) => void;
  'comment:delete': (data: { id: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  email: string;
  role: string;
  boardId?: string;
} 