import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Mock data
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
}

const mockBoard = {
  id: 'board-1',
  title: 'Test Board',
  description: 'Test Description',
  createdBy: 'test@example.com',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const mockSticker = {
  id: 'sticker-1',
  content: 'Test Sticker',
  stickerType: 'went-well',
  x: 100,
  y: 100,
  position: 0,
  createdBy: 'test@example.com',
  boardId: 'board-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  votes: [],
  comments: [],
}

// API handlers
export const handlers = [
  // Auth endpoints
  http.post('/api/auth/register', () => {
    return HttpResponse.json({ 
      message: 'User registered successfully',
      user: mockUser 
    })
  }),

  // Board endpoints
  http.get('/api/boards', () => {
    return HttpResponse.json([mockBoard])
  }),

  http.get('/api/boards/:boardId', ({ params }) => {
    return HttpResponse.json({
      ...mockBoard,
      id: params.boardId,
      stickers: [mockSticker],
      members: [
        {
          id: 'member-1',
          email: 'test@example.com',
          role: 'owner',
          boardId: params.boardId,
        }
      ]
    })
  }),

  http.post('/api/boards', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      ...mockBoard,
      ...body,
      id: 'new-board-id',
    })
  }),

  http.put('/api/boards/:boardId', async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({
      ...mockBoard,
      ...body,
      id: params.boardId,
    })
  }),

  http.delete('/api/boards/:boardId', ({ params }) => {
    return HttpResponse.json({ 
      message: 'Board deleted successfully',
      id: params.boardId 
    })
  }),

  // Sticker endpoints
  http.get('/api/boards/:boardId/stickers', () => {
    return HttpResponse.json([mockSticker])
  }),

  http.post('/api/boards/:boardId/stickers', async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({
      ...mockSticker,
      ...body,
      id: 'new-sticker-id',
      boardId: params.boardId,
    })
  }),

  http.put('/api/stickers/:stickerId', async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({
      ...mockSticker,
      ...body,
      id: params.stickerId,
    })
  }),

  http.delete('/api/stickers/:stickerId', ({ params }) => {
    return HttpResponse.json({ 
      message: 'Sticker deleted successfully',
      id: params.stickerId 
    })
  }),

  // Vote endpoints
  http.post('/api/votes', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: 'new-vote-id',
      ...body,
      createdAt: new Date().toISOString(),
    })
  }),

  http.delete('/api/votes/:voteId', ({ params }) => {
    return HttpResponse.json({ 
      message: 'Vote removed successfully',
      id: params.voteId 
    })
  }),

  // Comment endpoints
  http.post('/api/comments', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: 'new-comment-id',
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }),

  http.put('/api/comments/:commentId', async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: params.commentId,
      ...body,
      updatedAt: new Date().toISOString(),
    })
  }),

  http.delete('/api/comments/:commentId', ({ params }) => {
    return HttpResponse.json({ 
      message: 'Comment deleted successfully',
      id: params.commentId 
    })
  }),

  // Board members endpoints
  http.post('/api/board-members', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: 'new-member-id',
      ...body,
      joinedAt: new Date().toISOString(),
    })
  }),

  http.delete('/api/board-members/:memberId', ({ params }) => {
    return HttpResponse.json({ 
      message: 'Member removed successfully',
      id: params.memberId 
    })
  }),
]

// Create server instance
export const server = setupServer(...handlers) 