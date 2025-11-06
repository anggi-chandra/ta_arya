import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = 
    path === "/login" || 
    path === "/register" || 
    path === "/" || 
    path.startsWith("/api/auth") ||
    path.startsWith("/api/events") ||
    path.startsWith("/api/tournaments") ||
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

  // Helper: cek role user via Supabase
  async function getUserRoles(userId?: string): Promise<string[]> {
    if (!userId) return [];
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (error || !data) return [];
    return data.map((r: any) => r.role);
  }

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

  // Enforce admin-only access for /admin routes
  if (path.startsWith("/admin")) {
    const roles = await getUserRoles(token?.sub as string | undefined);
    const isAdminOrModerator = roles.includes("admin") || roles.includes("moderator");
    if (!isAdminOrModerator) {
      // Non-admin trying to access admin area -> redirect to user dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Redirect admin users opening /dashboard to /admin
  if (path.startsWith("/dashboard") && isAuthenticated) {
    const roles = await getUserRoles(token?.sub as string | undefined);
    const isAdminOrModerator = roles.includes("admin") || roles.includes("moderator");
    if (isAdminOrModerator) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
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