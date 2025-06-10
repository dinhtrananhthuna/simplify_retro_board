/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react'
import { useAppToast } from '@/hooks/useAppToast'
import { toast } from 'sonner'

// Mock sonner với proper structure
jest.mock('sonner', () => {
  const mockToast = jest.fn()
  mockToast.success = jest.fn()
  mockToast.error = jest.fn()
  mockToast.warning = jest.fn()
  
  return {
    toast: mockToast
  }
})

const mockToast = toast as jest.MockedFunction<typeof toast> & {
  success: jest.MockedFunction<typeof toast.success>
  error: jest.MockedFunction<typeof toast.error>
  warning: jest.MockedFunction<typeof toast.warning>
}

describe('useAppToast', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should provide toast methods', () => {
    const { result } = renderHook(() => useAppToast())

    expect(result.current).toHaveProperty('success')
    expect(result.current).toHaveProperty('error')
    expect(result.current).toHaveProperty('info')
    expect(result.current).toHaveProperty('warning')
    expect(typeof result.current.success).toBe('function')
    expect(typeof result.current.error).toBe('function')
    expect(typeof result.current.info).toBe('function')
    expect(typeof result.current.warning).toBe('function')
  })

  it('should call toast.success when success method is invoked', () => {
    const { result } = renderHook(() => useAppToast())

    result.current.success('Success message')

    expect(mockToast.success).toHaveBeenCalledWith('Success message')
  })

  it('should call toast.error when error method is invoked', () => {
    const { result } = renderHook(() => useAppToast())

    result.current.error('Error message')

    expect(mockToast.error).toHaveBeenCalledWith('Error message')
  })

  it('should call toast when info method is invoked', () => {
    const { result } = renderHook(() => useAppToast())

    result.current.info('Info message')

    expect(mockToast).toHaveBeenCalledWith('Info message')
  })

  it('should call toast.warning when warning method is invoked', () => {
    const { result } = renderHook(() => useAppToast())

    result.current.warning('Warning message')

    expect(mockToast.warning).toHaveBeenCalledWith('Warning message')
  })
}) 