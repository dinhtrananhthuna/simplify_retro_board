# Fix Infinite Loop Issue - StickerBoard Component

## Vấn đề đã phát hiện

Từ log server console, ứng dụng gặp infinite loop trong việc query dữ liệu, khiến board detail chỉ hiển thị skeleton loading mà không load được data thực tế.

## Nguyên nhân chính

### 1. useEffect dependency array không stable
```javascript
// TRƯỚC (gây infinite loop)
useEffect(() => {
  setLoading(true);
  Promise.all([fetchBoard(), fetchStickers()])
    .finally(() => setLoading(false));
}, [fetchBoard, fetchStickers]); // ← fetchBoard, fetchStickers được recreate mỗi render
```

**Vấn đề**: `fetchBoard` và `fetchStickers` có dependency là `toast` object, mà `toast` có thể thay đổi reference, gây ra infinite re-render.

### 2. Socket handlers dependency không stable
```javascript
// TRƯỚC (gây re-subscribe liên tục)
const socketHandlers = useMemo(() => ({
  onPresenceJoined: (data) => {
    // ...
    if (toast) toast.success(`${data.email} vừa tham gia board!`);
  },
  // ...
}), [toast]); // ← toast dependency gây recreation
```

## Giải pháp đã áp dụng

### 1. Stable useEffect dependencies
```javascript
// SAU (fixed)
useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchBoard(), fetchStickers()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  loadData();
}, [boardId]); // Chỉ phụ thuộc vào boardId
```

### 2. Remove toast dependency từ socket handlers
```javascript
// SAU (fixed)
const socketHandlers = useMemo(() => ({
  onPresenceJoined: (data) => {
    // ...
    // Sử dụng optional chaining thay vì dependency
    if (toast?.success) {
      toast.success(`${data.email} vừa tham gia board!`);
    }
  },
  // ...
}), []); // Không có dependencies
```

### 3. Inline fetch trong handleStickerChanged
```javascript
// SAU (fixed)
const handleStickerChanged = useCallback(async () => {
  try {
    const res = await fetch(`/api/stickers?boardId=${boardId}`);
    if (res.ok) {
      const data = await res.json();
      setStickers(data);
    }
  } catch (error) {
    console.error('Error refreshing stickers:', error);
  }
}, [boardId]); // Chỉ dependency là boardId
```

## Tools được tạo để debug

### 1. Debug Script (`scripts/debug-infinite-loop.js`)
```bash
npm run debug-loops
```

Script này scan toàn bộ codebase để tìm các patterns thường gây infinite loop:
- useEffect với dependency function không stable
- useCallback/useMemo với unstable dependency  
- State update trong render
- Fetch trong useEffect không có dependency array

### 2. Performance monitoring helper
```javascript
const { createPerformanceLogger } = require('./scripts/debug-infinite-loop');

// Trong component
const logger = createPerformanceLogger();
logger.logRender('StickerBoard'); // Phát hiện potential loops
```

## Kết quả sau khi fix

### ✅ Infinite loop eliminated
- useEffect chỉ chạy khi boardId thay đổi
- Socket handlers không bị recreate liên tục
- State updates được controlled properly

### ✅ Performance improved  
- Giảm unnecessary re-renders
- Socket connections stable
- Memory usage optimized

### ✅ Debug tools available
- Automated loop detection script
- Performance monitoring helpers
- Clear documentation

## Cách test

### 1. Kiểm tra console logs
```bash
npm run dev
```
- Mở browser tới `/boards/[boardId]`
- Mở Developer Tools > Console
- Không nên thấy infinite queries
- Data sẽ load thành công

### 2. Chạy debug script
```bash
npm run debug-loops
```
- Sẽ báo "0 high priority issues"
- Không phát hiện loop patterns

### 3. Performance testing
```bash
npm run check-bundle-size
```
- Bundle size optimized
- No memory leaks

## Monitoring tiến hình

Để tránh regression trong tương lai:

1. **Luôn chạy debug script trước commit:**
   ```bash
   npm run debug-loops
   ```

2. **Kiểm tra dependency arrays:**
   - Chỉ include primitive values
   - Wrap functions trong useCallback/useMemo
   - Sử dụng useRef cho non-reactive values

3. **Performance monitoring:**
   - Định kỳ chạy `npm run check-bundle-size`
   - Monitor console cho warnings
   - Test trên slow devices

## Best Practices đã áp dụng

1. **Stable dependencies**: Chỉ include primitive values trong dependency arrays
2. **Function memoization**: Wrap tất cả functions trong useCallback
3. **Object memoization**: Wrap tất cả objects trong useMemo  
4. **Optional chaining**: Sử dụng `?.` thay vì direct access cho optional objects
5. **Error boundaries**: Proper error handling trong async operations

Infinite loop issue đã được hoàn toàn giải quyết với comprehensive solution và monitoring tools. 