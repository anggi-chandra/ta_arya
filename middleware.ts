import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = 
    path === "/login" || 
    path === "/register" || 
    path === "/" || 
    path.startsWith("/api/auth") ||
    path.startsWith("/_next") ||
    path.startsWith("/events") ||
    path.startsWith("/teams") ||
    path.startsWith("/tournaments") ||
    path.startsWith("/community") ||
    path.startsWith("/blog") ||
    path.startsWith("/faq") ||
    path.startsWith("/contact") ||
    path.startsWith("/support");

  // Define protected paths that require authentication
  const isProtectedPath = 
    path.startsWith("/dashboard") || 
    path.startsWith("/admin");

  // Get the token and check if the user is authenticated
  const token = await getToken({ req });
  const isAuthenticated = !!token;

  // Redirect logic
  if (isPublicPath) {
    // If user is on login/register page but already authenticated, redirect to dashboard
    if ((path === "/login" || path === "/register") && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    
    // Allow access to public paths
    return NextResponse.next();
  }

  // If user is trying to access protected path but not authenticated, redirect to login
  if (isProtectedPath && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // For all other cases, proceed normally
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files (e.g. robots.txt)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};