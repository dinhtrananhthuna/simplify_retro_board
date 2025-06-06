# Retrospective Board - Version 2 Plan
## Mục tiêu
Phát triển thêm các tính năng nâng cao để cải thiện trải nghiệm người dùng và thêm các công cụ hữu ích cho việc quản lý retrospective.

## Tính năng nâng cao

### 1. Nâng cấp Board Management
- [ ] Tùy chỉnh columns (thêm/xóa/sửa tên)
- [ ] Template boards
- [ ] Archive boards
- [ ] Duplicate boards
- [ ] Board categories/tags
- [ ] Board search và filter

### 2. Nâng cấp Sticker Management
- [ ] Phân loại stickers (tags/colors)
- [ ] Vote system cho stickers
- [ ] Merge stickers tương tự
- [ ] Thêm hình ảnh/emoji vào stickers
- [ ] Sticker templates
- [ ] Sticker search và filter
- [ ] Sticker history (version control)

### 3. Retrospective Session Management
- [ ] Tạo và quản lý lịch sử các phiên
- [ ] Timer cho mỗi phase
- [ ] Session templates
- [ ] Session notes
- [ ] Session summary
- [ ] Export session data

### 4. Team Collaboration Enhancement
- [ ] Chat system trong board
- [ ] @mentions
- [ ] Notifications system
- [ ] Activity feed
- [ ] Team roles nâng cao (Admin, Moderator, Member)
- [ ] Team settings và preferences

### 5. Analytics & Reporting
- [ ] Dashboard cho admin
- [ ] Thống kê các vấn đề thường gặp
- [ ] Theo dõi tiến độ action items
- [ ] Team performance metrics
- [ ] Export reports (PDF/Excel)
- [ ] Custom reports

### 6. Database Schema Updates (Version 2)
```sql
-- Thêm bảng mới
CREATE TABLE Board_Templates (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_by VARCHAR(36) FOREIGN KEY REFERENCES Users(id),
    columns JSON NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE Retrospective_Sessions (
    id VARCHAR(36) PRIMARY KEY,
    board_id VARCHAR(36) FOREIGN KEY REFERENCES Boards(id),
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_by VARCHAR(36) FOREIGN KEY REFERENCES Users(id)
);

CREATE TABLE Sticker_Votes (
    sticker_id VARCHAR(36) FOREIGN KEY REFERENCES Stickers(id),
    user_id VARCHAR(36) FOREIGN KEY REFERENCES Users(id),
    vote_type VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (sticker_id, user_id)
);

CREATE TABLE Sticker_Tags (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(50),
    created_by VARCHAR(36) FOREIGN KEY REFERENCES Users(id)
);

CREATE TABLE Sticker_Tag_Relations (
    sticker_id VARCHAR(36) FOREIGN KEY REFERENCES Stickers(id),
    tag_id VARCHAR(36) FOREIGN KEY REFERENCES Sticker_Tags(id),
    PRIMARY KEY (sticker_id, tag_id)
);

-- Thêm columns mới vào bảng Stickers
ALTER TABLE Stickers
ADD COLUMN tags JSON,
ADD COLUMN votes_count INT DEFAULT 0,
ADD COLUMN is_template BIT DEFAULT 0,
ADD COLUMN template_id VARCHAR(36) FOREIGN KEY REFERENCES Board_Templates(id);
```

## Kế hoạch triển khai

### Phase 1: Board & Sticker Enhancement (2 tuần)
- [ ] Implement custom columns
- [ ] Add template system
- [ ] Implement voting system
- [ ] Add sticker categorization
- [ ] Implement sticker merging

### Phase 2: Session Management (1 tuần)
- [ ] Implement session tracking
- [ ] Add timer system
- [ ] Create session templates
- [ ] Add session notes
- [ ] Implement export functionality

### Phase 3: Team Features Enhancement (1 tuần)
- [ ] Implement chat system
- [ ] Add notification system
- [ ] Create activity feed
- [ ] Enhance team roles
- [ ] Add team settings

### Phase 4: Analytics & Polish (2 tuần)
- [ ] Implement analytics dashboard
- [ ] Add reporting system
- [ ] Create export features
- [ ] Performance optimization
- [ ] UI/UX improvements

## Ưu tiên phát triển
1. Custom columns và templates
2. Voting system
3. Session management
4. Chat system
5. Analytics dashboard

## Lưu ý
- Đảm bảo backward compatibility với Version 1
- Tập trung vào performance khi thêm tính năng mới
- Cân nhắc UX khi thêm tính năng phức tạp
- Duy trì tính đơn giản của giao diện
- Tập trung vào tính năng có giá trị cao cho người dùng 