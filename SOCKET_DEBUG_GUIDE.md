# Socket Debug Guide

## Đã Fix được:
✅ Infinite loop issue đã được giải quyết
✅ Socket server hoạt động (200 OK response)
✅ Socket connection test pass

## Để debug socket trên browser:

### 1. Mở browser console và truy cập:
```
http://localhost:3001/boards/[BOARD_ID]
```

### 2. Logs cần tìm:
- `[StickerBoardClient] Rendering with:` - Component render
- `[StickerBoard] Component rendering with boardId:` - Board component render 
- `[useSocket] Hook called with:` - Socket hook được gọi
- `[useSocket] Setting up socket for board:` - Socket setup
- `[useSocket] Creating new socket connection to:` - Socket connection
- `[useSocket] Connected!` - Socket connected
- `[useSocket] Emitting presence:join for board:` - Join room event

### 3. Nếu không thấy logs:
- Check console có bật không
- Reload page
- Check network tab có API calls không
- Check session có valid không

### 4. Test manual socket connection:
```javascript
// Trong browser console:
const socket = io('http://localhost:3001', {
  path: '/api/socket',
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('Manual socket connected!', socket.id);
});
```

### 5. Commands để test:
```bash
# Test socket server
npm run test-socket

# Monitor network requests  
npm run monitor-requests

# Debug infinite loops
npm run debug-loops
```

## Thay đổi đã làm:
1. ✅ Fixed infinite loop trong useSocket và StickerBoard
2. ✅ Removed session dependency block trong useSocket
3. ✅ Added proper client wrapper (StickerBoardClient)
4. ✅ Added debug logs toàn bộ flow
5. ✅ Socket server hoạt động đúng

## Next steps:
1. Test trên browser để xem socket logs
2. Nếu vẫn không hoạt động, check SessionProvider
3. Check CORS và environment variables 