import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Middleware function chạy sau khi authentication đã được verify
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Các routes cần bảo vệ
        const protectedPaths = ['/dashboard', '/boards'];
        const isProtectedPath = protectedPaths.some(path => 
          req.nextUrl.pathname.startsWith(path)
        );
        
        if (isProtectedPath) {
          return !!token; // Chỉ cho phép nếu có token (đã đăng nhập)
        }
        
        return true; // Cho phép tất cả các routes khác
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (authentication pages)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|auth).*)",
  ],
}; 