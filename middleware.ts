import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Check if user is trying to access admin routes
    if (pathname.startsWith("/admin")) {
      // Only allow ADMIN role to access admin routes
      if (token?.role !== "ADMIN") {
        return Response.redirect(new URL("/dashboard", req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Basic auth check - user must be logged in
        if (!token) return false
        
        // Admin routes require ADMIN role
        if (pathname.startsWith("/admin")) {
          return token.role === "ADMIN"
        }
        
        // Other protected routes just need authentication
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"]
}