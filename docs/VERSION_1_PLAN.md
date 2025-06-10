# Retrospective Board - Version 1 Plan
## Mục tiêu
Xây dựng phiên bản cơ bản của Retrospective Board với các tính năng thiết yếu để team có thể thực hiện retrospective meeting một cách hiệu quả.

## Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQL Server (Local)
- **Real-time**: Socket.io
- **Authentication**: NextAuth.js

## Tính năng cốt lõi

### 1. Authentication & User Management
- [ ] Đăng ký/Đăng nhập với email
- [ ] Phân quyền cơ bản (Admin, Member)
- [ ] Quản lý profile người dùng

### 2. Board Management
- [ ] Tạo board mới
- [ ] 3 columns cố định: "What went well?", "What to improve?", "Action plan"
- [ ] Xem danh sách boards
- [ ] Xóa board
- [ ] Đổi tên board

### 3. Sticker Management
- [ ] Thêm sticker vào column
- [ ] Sửa nội dung sticker
- [ ] Xóa sticker
- [ ] Hiển thị người tạo sticker
- [ ] Hiển thị thời gian tạo

### 4. Team Collaboration
- [ ] Invite thành viên vào board
- [ ] Real-time updates khi có thay đổi
- [ ] Hiển thị danh sách thành viên trong board
- [ ] Hiển thị trạng thái online/offline của thành viên

### 5. Database Schema (Version 1)
```sql
-- Users
CREATE TABLE Users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- Boards
CREATE TABLE Boards (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_by VARCHAR(36) FOREIGN KEY REFERENCES Users(id),
    created_at DATETIME DEFAULT GETDATE(),
    status VARCHAR(50) DEFAULT 'active'
);

-- Board_Members
CREATE TABLE Board_Members (
    board_id VARCHAR(36) FOREIGN KEY REFERENCES Boards(id),
    user_id VARCHAR(36) FOREIGN KEY REFERENCES Users(id),
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (board_id, user_id)
);

-- Stickers
CREATE TABLE Stickers (
    id VARCHAR(36) PRIMARY KEY,
    board_id VARCHAR(36) FOREIGN KEY REFERENCES Boards(id),
    column_type VARCHAR(50) NOT NULL, -- 'went_well', 'to_improve', 'action_plan'
    content TEXT NOT NULL,
    created_by VARCHAR(36) FOREIGN KEY REFERENCES Users(id),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
```

## Kế hoạch triển khai

### Phase 1: Setup & Authentication (1 tuần)
- [x] Setup project Next.js
- [x] Cấu hình SQL Server local
- [x] Setup authentication
- [x] Setup basic UI components

### Phase 2: Core Board Features (1 tuần)
- [x] Implement board CRUD
- [x] Implement sticker management
- [x] Setup real-time updates
- [x] Basic UI implementation

### Phase 3: Team Features (1 tuần)
- [x] Implement invite system
- [x] Add member management (để sang version 2)
- [x] Implement real-time presence
- [x] Polish UI/UX

### Phase 4: Testing & Deployment (1 tuần)
- [ ] Unit testing
- [ ] Integration testing
- [ ] Performance testing
- [ ] Setup local deployment
- [ ] Documentation

## Ưu tiên phát triển
1. Authentication system
2. Board creation và management
3. Sticker management
4. Real-time updates
5. Team collaboration features

## Lưu ý
- Tập trung vào tính năng cốt lõi
- Đảm bảo performance tốt với real-time updates
- UI đơn giản, dễ sử dụng
- Tập trung vào trải nghiệm người dùng cơ bản 