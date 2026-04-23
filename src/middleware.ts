import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { USER_ROLES } from "@/lib/utils/constants";

// =============================================================================
// AUTH MIDDLEWARE — LLC-Lanka Issue Tracker Platform
// =============================================================================

// Routes that require authentication
const AUTH_REQUIRED_ROUTES = [
  "/",
  "/overview",
  "/issues",
  "/chat",
  "/polls",
  "/admin",
  "/profile",
  "/search",
  "/notifications",
];

// Routes accessible only to Super Admin
const SUPER_ADMIN_ROUTES = ["/admin"];

// Routes accessible only to authenticated users (not for public/auth pages)
const PROTECTED_ROUTES = [...AUTH_REQUIRED_ROUTES, ...SUPER_ADMIN_ROUTES];

// Public routes (no auth required)
const PUBLIC_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/first-login",
  "/accept-invite",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path is a public route
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if the current path is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get the session token from cookies
  const sessionToken = request.cookies.get("next-auth.session-token")?.value
    || request.cookies.get("__Secure-next-auth.session-token")?.value;

  // If no session token and route requires auth, redirect to login
  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For Super Admin routes, check if user has SUPER_ADMIN role
  // Note: Role check requires a database lookup which should be done in API routes
  // The edge middleware cannot access Prisma, so we pass the role via a header
  // set by the API route after verification
  if (SUPER_ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    const userRole = request.cookies.get("llc-user-role")?.value;

    if (userRole !== USER_ROLES.SUPER_ADMIN) {
      // Redirect to dashboard if not Super Admin
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - api routes (except auth)
     * - *.png, *.jpg, *.jpeg, *.gif, *.svg, *.ico
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/auth|.*\\.(?:png|jpg|jpeg|gif|svg|ico)$).*)",
  ],
};
