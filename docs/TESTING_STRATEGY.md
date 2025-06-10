# Testing Strategy - Retrospective Board

## Overview
Chiến lược testing toàn diện cho project Retrospective Board, bao gồm unit testing, integration testing, và component testing.

## Tech Stack Testing
- **Jest**: Framework testing chính
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking
- **node-mocks-http**: API route testing

## Testing Structure

```
src/
├── __tests__/
│   ├── components/          # Component tests
│   ├── hooks/              # Custom hooks tests
│   ├── api/                # API routes tests
│   ├── utils/              # Utility functions tests
│   └── integration/        # Integration tests
├── __mocks__/
│   ├── server.ts           # MSW server setup
│   └── socket.ts           # Socket.IO mocks
```

## Test Categories

### 1. Unit Tests
**Mục tiêu**: Test từng function/component riêng lẻ

**Bao gồm**:
- Custom hooks (useSocket, useAppToast)
- Utility functions
- Type guards và validators
- API handlers

**Ví dụ**:
```typescript
describe('useSocket', () => {
  it('should connect when user is authenticated', () => {
    // Test logic
  })
})
```

### 2. Component Tests
**Mục tiêu**: Test UI components và user interactions

**Bao gồm**:
- StickerCard rendering và interactions
- StickerBoard drag & drop
- CommentSection CRUD operations
- Form validations

**Ví dụ**:
```typescript
describe('StickerCard', () => {
  it('should render sticker content', () => {
    renderWithAuth(<StickerCard sticker={mockSticker} />)
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })
})
```

### 3. Integration Tests
**Mục tiêu**: Test flow hoàn chỉnh từ UI đến API

**Bao gồm**:
- Board creation flow
- Real-time collaboration
- Authentication flow
- Sticker CRUD với Socket.IO

### 4. API Tests
**Mục tiêu**: Test API endpoints và business logic

**Bao gồm**:
- Authentication middleware
- CRUD operations
- Error handling
- Data validation

## Test Data Management

### Mock Data
```typescript
// src/__mocks__/data.ts
export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
}

export const mockBoard = {
  id: 'board-1',
  title: 'Test Board',
  createdBy: 'test@example.com',
  stickers: [],
  members: [],
}
```

### Test Utilities
```typescript
// src/__tests__/utils/test-utils.tsx
export const renderWithAuth = (ui: ReactElement) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <SessionProvider session={mockSession}>
        {children}
      </SessionProvider>
    )
  })
}
```

## Real-time Testing Strategy

### Socket.IO Testing
- Mock socket connections
- Test event emissions
- Test event listeners
- Test presence system

```typescript
describe('Real-time Features', () => {
  it('should emit sticker creation event', () => {
    const { createSticker } = useSocket('board-123')
    createSticker({ content: 'Test', type: 'went-well' })
    
    expect(mockSocket.emit).toHaveBeenCalledWith('sticker:create', {
      content: 'Test',
      stickerType: 'went-well',
      boardId: 'board-123'
    })
  })
})
```

### Presence System Testing
- Test join/leave events
- Test online/offline status
- Test member list updates

## Test Coverage Requirements

### Minimum Coverage Thresholds
- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 70%
- **Statements**: 70%

### Priority Areas (>90% coverage)
- Authentication logic
- Socket event handlers
- Data validation
- Critical business logic

## Testing Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

## Testing Best Practices

### 1. Test Naming
```typescript
describe('ComponentName', () => {
  describe('when user is authenticated', () => {
    it('should display user-specific content', () => {
      // Test implementation
    })
  })
})
```

### 2. Setup & Cleanup
```typescript
describe('API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    server.resetHandlers()
  })
  
  afterAll(() => {
    server.close()
  })
})
```

### 3. Mock Strategy
- Mock external dependencies (APIs, Socket.IO)
- Keep mocks simple và reusable
- Use MSW cho API mocking
- Mock timers khi cần thiết

### 4. Async Testing
```typescript
it('should handle async operations', async () => {
  renderWithAuth(<Component />)
  
  await waitFor(() => {
    expect(screen.getByText('Loaded data')).toBeInTheDocument()
  })
})
```

## Error Testing

### Network Errors
```typescript
it('should handle network errors gracefully', async () => {
  server.use(
    http.get('/api/boards', () => {
      return HttpResponse.error()
    })
  )
  
  renderWithAuth(<BoardList />)
  
  await waitFor(() => {
    expect(screen.getByText(/error loading/i)).toBeInTheDocument()
  })
})
```

### Validation Errors
```typescript
it('should display validation errors', async () => {
  renderWithAuth(<CreateBoardForm />)
  
  fireEvent.click(screen.getByRole('button', { name: /create/i }))
  
  await waitFor(() => {
    expect(screen.getByText(/title is required/i)).toBeInTheDocument()
  })
})
```

## Performance Testing

### Component Performance
- Test rendering performance
- Test re-render optimization
- Test memory leaks

### Socket Performance
- Test connection handling
- Test event processing speed
- Test reconnection logic

## Security Testing

### Authentication Testing
- Test protected routes
- Test session validation
- Test authorization logic

### Input Validation Testing
- Test XSS protection
- Test SQL injection protection
- Test input sanitization

## Continuous Integration

### GitHub Actions Setup
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test:ci
```

## Debugging Tests

### Common Issues
1. **Timer Issues**: Use `jest.useFakeTimers()`
2. **Async Issues**: Use `waitFor()` và `findBy*` queries
3. **Mock Issues**: Kiểm tra mock setup trong `beforeEach`
4. **DOM Issues**: Đảm bảo cleanup sau mỗi test

### Debug Commands
```bash
# Run specific test file
npm test -- StickerCard.test.tsx

# Run tests with verbose output
npm test -- --verbose

# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Future Improvements

### Phase 2 Testing
- [ ] E2E testing với Playwright
- [ ] Visual regression testing
- [ ] Performance monitoring
- [ ] Accessibility testing
- [ ] Load testing cho Socket.IO

### Advanced Features
- [ ] Snapshot testing cho UI
- [ ] Property-based testing
- [ ] Mutation testing
- [ ] Cross-browser testing 