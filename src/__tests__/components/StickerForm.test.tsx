/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StickerForm from '@/app/boards/[boardId]/components/StickerForm'
import { useAppToast } from '@/hooks/useAppToast'

// Mock useAppToast
jest.mock('@/hooks/useAppToast')
const mockUseAppToast = useAppToast as jest.MockedFunction<typeof useAppToast>

// Mock fetch
global.fetch = jest.fn()

describe('StickerForm Component', () => {
  const mockProps = {
    boardId: 'board-1',
    stickerType: 'went-well',
    onCreated: jest.fn(),
  }

  const mockToast = {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAppToast.mockReturnValue(mockToast)
    
    // Mock successful responses by default
    ;(global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/stickers?boardId=')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      })
    })
  })

  describe('Basic Rendering', () => {
    it('should render form with input and button', () => {
      render(<StickerForm {...mockProps} />)
      
      expect(screen.getByPlaceholderText('Add a sticker...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
    })

    it('should have submit button disabled when input is empty', () => {
      render(<StickerForm {...mockProps} />)
      
      const submitButton = screen.getByRole('button')
      expect(submitButton).toBeDisabled()
    })

    it('should enable submit button when input has content', async () => {
      const user = userEvent.setup()
      render(<StickerForm {...mockProps} />)
      
      const input = screen.getByPlaceholderText('Add a sticker...')
      await user.type(input, 'Test sticker content')
      
      const submitButton = screen.getByRole('button')
      expect(submitButton).toBeEnabled()
    })
  })

  describe('Form Submission', () => {
    it('should submit form with correct data', async () => {
      const user = userEvent.setup()
      render(<StickerForm {...mockProps} />)
      
      const input = screen.getByPlaceholderText('Add a sticker...')
      await user.type(input, 'Test sticker content')
      
      const form = screen.getByRole('form') || input.closest('form')
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/stickers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: 'Test sticker content',
            stickerType: 'went-well',
            boardId: 'board-1',
            position: 0,
          }),
        })
      })
    })

    it('should clear input after successful submission', async () => {
      const user = userEvent.setup()
      render(<StickerForm {...mockProps} />)
      
      const input = screen.getByPlaceholderText('Add a sticker...')
      await user.type(input, 'Test content')
      
      const form = input.closest('form')
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        expect(input).toHaveValue('')
      })
    })

    it('should call onCreated after successful submission', async () => {
      const user = userEvent.setup()
      render(<StickerForm {...mockProps} />)
      
      const input = screen.getByPlaceholderText('Add a sticker...')
      await user.type(input, 'Test content')
      
      const form = input.closest('form')
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        expect(mockProps.onCreated).toHaveBeenCalled()
      })
    })

    it('should show success toast after successful submission', async () => {
      const user = userEvent.setup()
      render(<StickerForm {...mockProps} />)
      
      const input = screen.getByPlaceholderText('Add a sticker...')
      await user.type(input, 'Test content')
      
      const form = input.closest('form')
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Tạo sticker thành công!')
      })
    })
  })

  describe('Error Handling', () => {
    it('should show error message when submission fails', async () => {
      ;(global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('/api/stickers?boardId=')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          })
        }
        return Promise.resolve({
          ok: false,
          status: 500
        })
      })

      const user = userEvent.setup()
      render(<StickerForm {...mockProps} />)
      
      const input = screen.getByPlaceholderText('Add a sticker...')
      await user.type(input, 'Test content')
      
      const form = input.closest('form')
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        expect(screen.getByText('Tạo sticker thất bại')).toBeInTheDocument()
      })
    })

    it('should show error toast when submission fails', async () => {
      ;(global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('/api/stickers?boardId=')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          })
        }
        return Promise.resolve({
          ok: false,
          status: 500
        })
      })

      const user = userEvent.setup()
      render(<StickerForm {...mockProps} />)
      
      const input = screen.getByPlaceholderText('Add a sticker...')
      await user.type(input, 'Test content')
      
      const form = input.closest('form')
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Tạo sticker thất bại!')
      })
    })

    it('should not submit form with empty content', async () => {
      render(<StickerForm {...mockProps} />)
      
      const form = screen.getByPlaceholderText('Add a sticker...').closest('form')
      if (form) {
        fireEvent.submit(form)
      }

      // Should not make any API calls
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should not submit form with only whitespace', async () => {
      const user = userEvent.setup()
      render(<StickerForm {...mockProps} />)
      
      const input = screen.getByPlaceholderText('Add a sticker...')
      await user.type(input, '   ')
      
      const form = input.closest('form')
      if (form) {
        fireEvent.submit(form)
      }

      // Should not make any API calls for content
      expect(global.fetch).not.toHaveBeenCalledWith('/api/stickers', expect.any(Object))
    })
  })

  describe('Loading State', () => {
    it('should disable input and button during submission', async () => {
      // Mock a slow response
      ;(global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100))
      )

      const user = userEvent.setup()
      render(<StickerForm {...mockProps} />)
      
      const input = screen.getByPlaceholderText('Add a sticker...')
      const submitButton = screen.getByRole('button')
      
      await user.type(input, 'Test content')
      
      const form = input.closest('form')
      if (form) {
        fireEvent.submit(form)
      }

      // Check loading state
      expect(input).toBeDisabled()
      expect(submitButton).toBeDisabled()
    })

    it('should show loading icon during submission', async () => {
      // Mock a slow response
      ;(global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100))
      )

      const user = userEvent.setup()
      render(<StickerForm {...mockProps} />)
      
      const input = screen.getByPlaceholderText('Add a sticker...')
      await user.type(input, 'Test content')
      
      const form = input.closest('form')
      if (form) {
        fireEvent.submit(form)
      }

      // Check for loading icon (Loader2 component)
      expect(document.querySelector('.lucide-loader-2')).toBeInTheDocument()
    })
  })

  describe('Position Calculation', () => {
    it('should calculate correct position based on existing stickers', async () => {
      // Mock existing stickers
      ;(global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('/api/stickers?boardId=')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([
              { stickerType: 'went-well' },
              { stickerType: 'went-well' },
              { stickerType: 'to-improve' },
            ])
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({})
        })
      })

      const user = userEvent.setup()
      render(<StickerForm {...mockProps} />)
      
      const input = screen.getByPlaceholderText('Add a sticker...')
      await user.type(input, 'Test content')
      
      const form = input.closest('form')
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/stickers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: 'Test content',
            stickerType: 'went-well',
            boardId: 'board-1',
            position: 2, // 2 existing stickers with same type
          }),
        })
      })
    })
  })

  describe('Fallback Behavior', () => {
    it('should use window.alert when toast is not available', async () => {
      mockUseAppToast.mockReturnValue(null)
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

      const user = userEvent.setup()
      render(<StickerForm {...mockProps} />)
      
      const input = screen.getByPlaceholderText('Add a sticker...')
      await user.type(input, 'Test content')
      
      const form = input.closest('form')
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Tạo sticker thành công!')
      })

      alertSpy.mockRestore()
    })
  })
}) 