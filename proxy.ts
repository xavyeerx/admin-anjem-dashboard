import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Fully public — no auth needed
const ALWAYS_PUBLIC = ["/", "/super", "/api/cabang"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets, Next internals
  if (
    pathname.startsWith("/_next/") ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|gif)$/)
  ) {
    return NextResponse.next();
  }

  // API auth (login/logout) — always public
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Public cabang-info API
  if (pathname.startsWith("/api/cabang")) {
    return NextResponse.next();
  }

  // Landing page + super admin page — public (super has its own auth flow)
  if (ALWAYS_PUBLIC.includes(pathname)) {
    return NextResponse.next();
  }

  // /[cabang]/login — public
  if (pathname.match(/^\/[^/]+\/login(\/.*)?$/)) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protect API routes
  if (pathname.startsWith("/api/")) {
    if (!user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }
    // Enforce cabang access for /api/[cabang]/* routes
    const cabangMatch = pathname.match(/^\/api\/([^/]+)\//);
    if (cabangMatch) {
      const cabangId = cabangMatch[1];
      if (!["auth", "cabang"].includes(cabangId)) {
        const role = user.user_metadata?.role as string | undefined;
        const userCabang = user.user_metadata?.cabang_id as string | undefined;
        if (role !== "super_admin" && userCabang !== cabangId) {
          return NextResponse.json({ data: null, error: "Akses cabang tidak diizinkan" }, { status: 403 });
        }
      }
    }
    return response;
  }

  // Protect /[cabang]/* pages
  const cabangPageMatch = pathname.match(/^\/([^/]+)(\/.*)?$/);
  if (cabangPageMatch) {
    const segment = cabangPageMatch[1];
    // Skip known non-cabang segments
    if (!["api", "_next", "super", "favicon"].includes(segment)) {
      if (!user) {
        return NextResponse.redirect(new URL(`/${segment}/login`, request.url));
      }
      const role = user.user_metadata?.role as string | undefined;
      const userCabang = user.user_metadata?.cabang_id as string | undefined;
      if (role !== "super_admin" && userCabang !== segment) {
        return NextResponse.redirect(new URL(`/${segment}/login`, request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
