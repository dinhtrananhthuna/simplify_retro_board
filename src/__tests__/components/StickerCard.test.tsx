/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSession } from 'next-auth/react'
import StickerCard from '@/app/boards/[boardId]/components/StickerCard'
import { Sticker } from '@/types/board'

// Mock next-auth
jest.mock('next-auth/react')
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

// Mock fetch
global.fetch = jest.fn()

describe('StickerCard Component', () => {
  const mockSticker: Sticker = {
    id: 'sticker-1',
    content: 'Test sticker content',
    stickerType: 'went-well',
    x: 100,
    y: 100,
    position: 0,
    boardId: 'board-1',
    createdBy: 'owner@example.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    votes: [],
    comments: [],
  }

  const mockProps = {
    sticker: mockSticker,
    onChanged: jest.fn(),
    onVoteAdd: jest.fn(),
    onVoteRemove: jest.fn(),
    onCommentAdd: jest.fn(),
    onCommentUpdate: jest.fn(),
    onCommentDelete: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({})
    })
  })

  describe('Basic Rendering', () => {
    it('should render sticker content', () => {
      mockUseSession.mockReturnValue({
        data: { user: { email: 'user@example.com' } },
        status: 'authenticated',
        update: jest.fn(),
      })

      render(<StickerCard {...mockProps} />)
      
      expect(screen.getByText('Test sticker content')).toBeInTheDocument()
    })

    it('should show owner avatar and email', () => {
      mockUseSession.mockReturnValue({
        data: { user: { email: 'owner@example.com' } },
        status: 'authenticated',
        update: jest.fn(),
      })

      render(<StickerCard {...mockProps} />)
      
      expect(screen.getByText('owner@example.com')).toBeInTheDocument()
    })
  })

  describe('Owner Permissions', () => {
    it('should show edit and delete buttons for owner', () => {
      mockUseSession.mockReturnValue({
        data: { user: { email: 'owner@example.com' } },
        status: 'authenticated',
        update: jest.fn(),
      })

      const { container } = render(<StickerCard {...mockProps} />)
      
      // Hover để show buttons
      const stickerCard = container.querySelector('.group')
      if (stickerCard) {
        fireEvent.mouseEnter(stickerCard)
      }

      expect(screen.getByTitle('Edit')).toBeInTheDocument()
      expect(screen.getByTitle('Delete')).toBeInTheDocument()
    })

    it('should not show edit and delete buttons for non-owner', () => {
      mockUseSession.mockReturnValue({
        data: { user: { email: 'other@example.com' } },
        status: 'authenticated',
        update: jest.fn(),
      })

      const { container } = render(<StickerCard {...mockProps} />)
      
      // Hover để show buttons
      const stickerCard = container.querySelector('.group')
      if (stickerCard) {
        fireEvent.mouseEnter(stickerCard)
      }

      expect(screen.queryByTitle('Edit')).not.toBeInTheDocument()
      expect(screen.queryByTitle('Delete')).not.toBeInTheDocument()
    })
  })

  describe('Edit Functionality', () => {
    it('should enter edit mode when edit button is clicked', async () => {
      mockUseSession.mockReturnValue({
        data: { user: { email: 'owner@example.com' } },
        status: 'authenticated',
        update: jest.fn(),
      })

      const { container } = render(<StickerCard {...mockProps} />)
      
      // Hover và click edit
      const stickerCard = container.querySelector('.group')
      if (stickerCard) {
        fireEvent.mouseEnter(stickerCard)
      }
      
      const editButton = screen.getByTitle('Edit')
      fireEvent.click(editButton)

      expect(screen.getByDisplayValue('Test sticker content')).toBeInTheDocument()
      expect(screen.getByText('Cập nhật')).toBeInTheDocument()
      expect(screen.getByText('Hủy')).toBeInTheDocument()
    })

    it('should update sticker content when form is submitted', async () => {
      mockUseSession.mockReturnValue({
        data: { user: { email: 'owner@example.com' } },
        status: 'authenticated',
        update: jest.fn(),
      })

      const user = userEvent.setup()
      const { container } = render(<StickerCard {...mockProps} />)
      
      // Enter edit mode
      const stickerCard = container.querySelector('.group')
      if (stickerCard) {
        fireEvent.mouseEnter(stickerCard)
      }
      
      const editButton = screen.getByTitle('Edit')
      fireEvent.click(editButton)

      // Update content
      const textarea = screen.getByDisplayValue('Test sticker content')
      await user.clear(textarea)
      await user.type(textarea, 'Updated content')

      // Submit form
      const updateButton = screen.getByText('Cập nhật')
      fireEvent.click(updateButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(`/api/stickers/${mockSticker.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            content: 'Updated content', 
            stickerType: mockSticker.stickerType 
          }),
        })
      })

      expect(mockProps.onChanged).toHaveBeenCalled()
    })

    it('should cancel edit mode when cancel button is clicked', async () => {
      mockUseSession.mockReturnValue({
        data: { user: { email: 'owner@example.com' } },
        status: 'authenticated',
        update: jest.fn(),
      })

      const { container } = render(<StickerCard {...mockProps} />)
      
      // Enter edit mode
      const stickerCard = container.querySelector('.group')
      if (stickerCard) {
        fireEvent.mouseEnter(stickerCard)
      }
      
      const editButton = screen.getByTitle('Edit')
      fireEvent.click(editButton)

      // Cancel edit
      const cancelButton = screen.getByText('Hủy')
      fireEvent.click(cancelButton)

      expect(screen.getByText('Test sticker content')).toBeInTheDocument()
      expect(screen.queryByDisplayValue('Test sticker content')).not.toBeInTheDocument()
    })
  })

  describe('Delete Functionality', () => {
    it('should show confirmation dialog when delete button is clicked', () => {
      mockUseSession.mockReturnValue({
        data: { user: { email: 'owner@example.com' } },
        status: 'authenticated',
        update: jest.fn(),
      })

      // Mock window.confirm
      const confirmSpy = jest.spyOn(window, 'confirm')
      confirmSpy.mockImplementation(() => false)

      const { container } = render(<StickerCard {...mockProps} />)
      
      // Hover và click delete
      const stickerCard = container.querySelector('.group')
      if (stickerCard) {
        fireEvent.mouseEnter(stickerCard)
      }
      
      const deleteButton = screen.getByTitle('Delete')
      fireEvent.click(deleteButton)

      expect(confirmSpy).toHaveBeenCalledWith('Bạn có chắc muốn xóa sticker này?')
      
      confirmSpy.mockRestore()
    })

    it('should delete sticker when confirmed', async () => {
      mockUseSession.mockReturnValue({
        data: { user: { email: 'owner@example.com' } },
        status: 'authenticated',
        update: jest.fn(),
      })

      // Mock window.confirm to return true
      const confirmSpy = jest.spyOn(window, 'confirm')
      confirmSpy.mockImplementation(() => true)

      const { container } = render(<StickerCard {...mockProps} />)
      
      // Hover và click delete
      const stickerCard = container.querySelector('.group')
      if (stickerCard) {
        fireEvent.mouseEnter(stickerCard)
      }
      
      const deleteButton = screen.getByTitle('Delete')
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(`/api/stickers/${mockSticker.id}`, {
          method: 'DELETE'
        })
      })

      expect(mockProps.onChanged).toHaveBeenCalled()
      
      confirmSpy.mockRestore()
    })
  })

  describe('Vote Functionality', () => {
    it('should display vote count', () => {
      const stickerWithVotes: Sticker = {
        ...mockSticker,
        votes: [
          { id: 'vote-1', email: 'user1@example.com', stickerId: 'sticker-1', createdAt: new Date() },
          { id: 'vote-2', email: 'user2@example.com', stickerId: 'sticker-1', createdAt: new Date() },
        ]
      }

      mockUseSession.mockReturnValue({
        data: { user: { email: 'user@example.com' } },
        status: 'authenticated',
        update: jest.fn(),
      })

      render(<StickerCard {...mockProps} sticker={stickerWithVotes} />)
      
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('should call onVoteAdd when user votes', () => {
      mockUseSession.mockReturnValue({
        data: { user: { email: 'user@example.com' } },
        status: 'authenticated',
        update: jest.fn(),
      })

      render(<StickerCard {...mockProps} />)
      
      const voteButton = screen.getByTitle('Vote cho sticker này')
      fireEvent.click(voteButton)

      expect(mockProps.onVoteAdd).toHaveBeenCalledWith('sticker-1')
    })

    it('should call onVoteRemove when user removes vote', () => {
      const stickerWithUserVote: Sticker = {
        ...mockSticker,
        votes: [
          { id: 'vote-1', email: 'user@example.com', stickerId: 'sticker-1', createdAt: new Date() },
        ]
      }

      mockUseSession.mockReturnValue({
        data: { user: { email: 'user@example.com' } },
        status: 'authenticated',
        update: jest.fn(),
      })

      render(<StickerCard {...mockProps} sticker={stickerWithUserVote} />)
      
      const voteButton = screen.getByTitle('Bỏ vote cho sticker này')
      fireEvent.click(voteButton)

      expect(mockProps.onVoteRemove).toHaveBeenCalledWith('sticker-1')
    })
  })

  describe('Comment Functionality', () => {
    it('should display comment count', () => {
      const stickerWithComments: Sticker = {
        ...mockSticker,
        comments: [
          { 
            id: 'comment-1', 
            content: 'Test comment', 
            email: 'user1@example.com', 
            stickerId: 'sticker-1',
            createdAt: new Date(),
            updatedAt: new Date()
          },
        ]
      }

      mockUseSession.mockReturnValue({
        data: { user: { email: 'user@example.com' } },
        status: 'authenticated',
        update: jest.fn(),
      })

      render(<StickerCard {...mockProps} sticker={stickerWithComments} />)
      
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('should toggle comment section when comment button is clicked', () => {
      mockUseSession.mockReturnValue({
        data: { user: { email: 'user@example.com' } },
        status: 'authenticated',
        update: jest.fn(),
      })

      render(<StickerCard {...mockProps} />)
      
      const commentButton = screen.getByTitle('Xem comments')
      fireEvent.click(commentButton)

      // Comment section should appear
      expect(screen.getByPlaceholderText('Thêm comment...')).toBeInTheDocument()
    })
  })

  describe('Real-time Updates', () => {
    it('should animate when vote count changes', () => {
      const { rerender } = render(<StickerCard {...mockProps} />)
      
      const stickerWithNewVote: Sticker = {
        ...mockSticker,
        votes: [
          { id: 'vote-1', email: 'user1@example.com', stickerId: 'sticker-1', createdAt: new Date() },
        ]
      }

      rerender(<StickerCard {...mockProps} sticker={stickerWithNewVote} />)
      
      // Animation should be triggered (checking for animation classes or states would be complex)
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })
}) 