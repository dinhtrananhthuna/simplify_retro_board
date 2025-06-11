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
  title: string;
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

export interface TimerState {
  id: string;
  boardId: string;
  duration: number;        // seconds
  startTime: number;       // timestamp 
  isActive: boolean;
  isPaused: boolean;
  createdBy: string;
}

export interface TimerEvent {
  type: 'timer:start' | 'timer:pause' | 'timer:resume' | 'timer:stop';
  data: TimerState;
  timestamp: number;
} 