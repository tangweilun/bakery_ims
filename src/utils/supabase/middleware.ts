import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // IMPORTANT: This is where the issue might be.
  // Allow access to auth callback routes unconditionally
  const authCallbackPath = request.nextUrl.pathname === "/auth/callback";

  // If it's the callback route, we should always let it proceed without redirects
  if (authCallbackPath) {
    return supabaseResponse;
  }

  // For other routes, proceed with your protection logic
  const isAuthRoute = request.nextUrl.pathname.startsWith("/api/auth");

  const isPublicRoute =
    request.nextUrl.pathname.startsWith("/sign-in") ||
    request.nextUrl.pathname.startsWith("/sign-up") ||
    request.nextUrl.pathname.startsWith("/forgot-password") ||
    request.nextUrl.pathname.startsWith("/reset-password") ||
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/auth/auth-code-error") ||
    isAuthRoute;

  // If no user and trying to access protected route, redirect to sign-in
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  // If user is signed in and trying to access sign-in page, redirect to dashboard
  if (user && request.nextUrl.pathname.startsWith("/sign-in")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
