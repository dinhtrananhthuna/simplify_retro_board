# Kế hoạch triển khai Real-time Features

## 1. Cấu trúc Socket.IO Events

### Server-side events
```typescript
interface ServerToClientEvents {
  // Presence events
  'presence:joined': (data: { email: string, role: string }) => void;
  'presence:left': (data: { email: string }) => void;
  'presence:list': (data: { members: Array<{ email: string, role: string, online: boolean }> }) => void;
  
  // Sticker events
  'sticker:created': (data: Sticker) => void;
  'sticker:updated': (data: Sticker) => void;
  'sticker:deleted': (data: { id: string }) => void;
  'sticker:moved': (data: { id: string, x: number, y: number, position: number }) => void;
  
  // Vote events
  'vote:added': (data: { stickerId: string, email: string }) => void;
  'vote:removed': (data: { stickerId: string, email: string }) => void;
  
  // Comment events
  'comment:added': (data: Comment) => void;
  'comment:updated': (data: Comment) => void;
  'comment:deleted': (data: { id: string }) => void;
}
```

### Client-side events
```typescript
interface ClientToServerEvents {
  // Presence events
  'presence:join': (data: { boardId: string }) => void;
  'presence:leave': (data: { boardId: string }) => void;
  
  // Sticker events
  'sticker:create': (data: { content: string, stickerType: string, boardId: string, x?: number, y?: number }) => void;
  'sticker:update': (data: { id: string, content: string }) => void;
  'sticker:delete': (data: { id: string }) => void;
  'sticker:move': (data: { id: string, x: number, y: number, position: number }) => void;
  
  // Vote events
  'vote:add': (data: { stickerId: string }) => void;
  'vote:remove': (data: { stickerId: string }) => void;
  
  // Comment events
  'comment:add': (data: { stickerId: string, content: string }) => void;
  'comment:update': (data: { id: string, content: string }) => void;
  'comment:delete': (data: { id: string }) => void;
}
```

## 2. Các bước triển khai

### Phase 1: Setup Infrastructure (1 ngày)
- [x] Cài đặt dependencies: socket.io, socket.io-client
- [x] Tạo các file types cho socket events
- [x] Cập nhật Next.js config để hỗ trợ WebSocket
- [x] Tạo API route cho socket
- [x] Thêm model BoardPresence vào database schema

### Phase 2: Server Implementation (2 ngày)
- [x] Implement socket server với authentication
- [x] Xử lý presence events (join/leave)
- [x] Xử lý sticker events (create/update/delete/move)
- [ ] Xử lý vote events
- [ ] Xử lý comment events
- [ ] Implement error handling và logging

### Phase 3: Client Implementation (2 ngày)
- [ ] Tạo custom hook useSocket
- [ ] Implement BoardClient component với real-time features
- [ ] Update StickerBoard component để hỗ trợ real-time
- [ ] Thêm UI cho presence (online/offline status)
- [ ] Implement loading states và error handling
- [ ] Thêm animations cho real-time updates

### Phase 4: Testing & Optimization (1 ngày)
- [ ] Unit testing cho socket events
- [ ] Integration testing
- [ ] Performance testing và optimization
- [ ] Security testing
- [ ] UX testing và improvements

## 3. Lưu ý quan trọng

### Performance
- Sử dụng room để phân chia các board, tránh broadcast không cần thiết
- Implement rate limiting cho các events
- Sử dụng debounce cho các events như move sticker
- Tối ưu số lượng events được emit
- Implement caching cho các dữ liệu tĩnh

### Security
- Xác thực session cho mọi socket connection
- Kiểm tra quyền truy cập board trước khi join room
- Validate dữ liệu trước khi emit events
- Implement rate limiting để tránh spam
- Logging các actions quan trọng để audit

### Error Handling
- Xử lý reconnect khi mất kết nối
- Log lỗi và thông báo cho user
- Implement retry mechanism cho các operations quan trọng
- Graceful degradation khi socket không khả dụng
- Backup mechanism cho các operations quan trọng

### UX
- Hiển thị loading state khi đang kết nối
- Thông báo khi có thành viên join/leave
- Hiển thị trạng thái online/offline rõ ràng
- Animation cho các thay đổi real-time
- Feedback ngay lập tức cho user actions
- Xử lý edge cases (mất kết nối, reconnect, etc.)

### Monitoring
- Implement logging cho các socket events
- Theo dõi số lượng connections
- Monitor performance metrics
- Alert system cho các issues quan trọng
- Analytics cho user interactions

## 4. Dependencies

```json
{
  "dependencies": {
    "socket.io": "^4.7.4",
    "socket.io-client": "^4.7.4"
  }
}
```

## 5. Environment Variables

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
SOCKET_SERVER=true
```

## 6. Testing Checklist

### Unit Tests
- [ ] Socket connection/disconnection
- [ ] Authentication
- [ ] Room management
- [ ] Event handling
- [ ] Error handling

### Integration Tests
- [ ] End-to-end board collaboration
- [ ] Real-time updates
- [ ] Presence system
- [ ] Error recovery
- [ ] Performance under load

### Security Tests
- [ ] Authentication bypass
- [ ] Authorization checks
- [ ] Rate limiting
- [ ] Data validation
- [ ] Session handling

### Performance Tests
- [ ] Connection handling
- [ ] Event processing
- [ ] Memory usage
- [ ] CPU usage
- [ ] Network bandwidth 