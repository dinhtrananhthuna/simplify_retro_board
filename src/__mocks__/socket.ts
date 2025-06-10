// Mock Socket.IO client cho testing
export class MockSocket {
  private listeners: Record<string, Function[]> = {}
  public connected = false

  emit = jest.fn()
  
  on = jest.fn((event: string, callback: Function) => {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  })

  off = jest.fn((event: string, callback?: Function) => {
    if (!this.listeners[event]) return
    
    if (callback) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
    } else {
      delete this.listeners[event]
    }
  })

  disconnect = jest.fn(() => {
    this.connected = false
  })

  connect = jest.fn(() => {
    this.connected = true
  })

  // Helper method để trigger events trong tests
  mockEmit(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data))
    }
  }

  // Helper method để reset mock
  reset() {
    this.listeners = {}
    this.connected = false
    jest.clearAllMocks()
  }
}

// Export instance để sử dụng trong tests
export const mockSocket = new MockSocket()

// Mock io function
export const mockIo = jest.fn(() => mockSocket) 