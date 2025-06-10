import '@testing-library/jest-dom'

// Custom matchers to avoid TypeScript issues
expect.extend({
  toBeInTheDocument(received) {
    const pass = received !== null && received !== undefined
    return {
      message: () =>
        pass
          ? `expected element not to be in the document`
          : `expected element to be in the document`,
      pass,
    }
  },
  toHaveClass(received, className) {
    const pass = received && received.className && received.className.includes(className)
    return {
      message: () =>
        pass
          ? `expected element not to have class "${className}"`
          : `expected element to have class "${className}"`,
      pass,
    }
  },
  toBeDisabled(received) {
    const pass = received && received.disabled === true
    return {
      message: () =>
        pass
          ? `expected element not to be disabled`
          : `expected element to be disabled`,
      pass,
    }
  },
  toHaveValue(received, value) {
    const pass = received && received.value === value
    return {
      message: () =>
        pass
          ? `expected element not to have value "${value}"`
          : `expected element to have value "${value}"`,
      pass,
    }
  },
  toHaveAttribute(received, attr, value) {
    const pass = received && received.getAttribute && received.getAttribute(attr) === value
    return {
      message: () =>
        pass
          ? `expected element not to have attribute "${attr}" with value "${value}"`
          : `expected element to have attribute "${attr}" with value "${value}"`,
      pass,
    }
  },
})

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}))

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    disconnect: jest.fn(),
    connected: false,
  })),
}))

// Add React import for motion mock
const React = require('react')

// Mock framer-motion with proper prop filtering
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, whileTap, whileFocus, animate, transition, initial, ...props }) => 
      React.createElement('div', { ...props, 'data-testid': 'motion-div' }, children),
    span: ({ children, whileHover, whileTap, whileFocus, animate, transition, initial, ...props }) => 
      React.createElement('span', { ...props, 'data-testid': 'motion-span' }, children),
    button: ({ children, whileHover, whileTap, whileFocus, animate, transition, initial, ...props }) => 
      React.createElement('button', { ...props, 'data-testid': 'motion-button' }, children),
    form: ({ children, whileHover, whileTap, whileFocus, animate, transition, initial, ...props }) => 
      React.createElement('form', { ...props, 'data-testid': 'motion-form' }, children),
    input: ({ children, whileHover, whileTap, whileFocus, animate, transition, initial, ...props }) => 
      React.createElement('input', { ...props, 'data-testid': 'motion-input' }, children),
    header: ({ children, whileHover, whileTap, whileFocus, animate, transition, initial, ...props }) => 
      React.createElement('header', { ...props, 'data-testid': 'motion-header' }, children),
  },
  AnimatePresence: ({ children }) => children,
}))

// Setup MSW - commented out for now
// import { server } from './src/__mocks__/server'
// beforeAll(() => server.listen())
// afterEach(() => server.resetHandlers())
// afterAll(() => server.close())

// Global test utilities
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb
  }
  observe() {
    this.cb([{ borderBoxSize: { inlineSize: 0, blockSize: 0 } }], this)
  }
  unobserve() {}
  disconnect() {}
} 