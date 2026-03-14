import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getOptionalClientEnv } from "@/lib/env";

function getSafeNext(pathname: string, search: string) {
  if (!pathname.startsWith("/") || pathname.startsWith("//")) {
    return "/app";
  }

  return `${pathname}${search}`;
}

export async function updateSession(request: NextRequest) {
  const env = getOptionalClientEnv();
  let response = NextResponse.next({
    request,
  });

  if (!env) {
    if (request.nextUrl.pathname.startsWith("/app")) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("error", "auth_not_configured");
      loginUrl.searchParams.set("next", getSafeNext(request.nextUrl.pathname, request.nextUrl.search));
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = pathname.startsWith("/app");
  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  if (isProtectedRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", getSafeNext(request.nextUrl.pathname, request.nextUrl.search));
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && user) {
    const appUrl = request.nextUrl.clone();
    appUrl.pathname = "/app";
    appUrl.search = "";
    return NextResponse.redirect(appUrl);
  }

  return response;
}