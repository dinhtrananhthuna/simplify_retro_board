# App Layout Policy

## 1. Landing Page Layout
- Áp dụng cho: Trang chủ ("/")
- Chức năng: Giới thiệu website, các tính năng chính
- Thành phần:
  - Nội dung landing page
  - Link đến Login/Register
  - Không có topbar, không có footer (hoặc có thể có footer đơn giản)

## 2. Auth Layout
- Áp dụng cho: Login, Register ("/auth/signin", "/auth/register")
- Chức năng: Đăng nhập, đăng ký
- Thành phần:
  - Chỉ chứa form đăng nhập/đăng ký
  - Không có topbar, không có footer
  - Giao diện tập trung, đơn giản

## 3. Protected Layout
- Áp dụng cho: Dashboard, Board Detail, Profile, ...
- Chức năng: Các trang chỉ user đã login mới xem được
- Thành phần:
  - Topbar (AppBar): logo, menu, avatar, logout
  - Footer
  - Main content: chứa các page con (dashboard, board detail, profile...)
  - Có thể có floating toolbar bên trái (cho các công cụ thao tác retro board)
  - Responsive, dark mode, toast notification đồng nhất

---

**Ghi chú:**
- Các layout này sẽ được tách biệt rõ ràng, dễ mở rộng, dễ bảo trì.
- Các trang thuộc nhóm protected sẽ luôn kiểm tra session ở server, chỉ render UI khi đã login.
- Đây là chuẩn layout sẽ áp dụng cho toàn bộ dự án. 