import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import {
  getDashboardPathForRole,
  isDashboardPath,
  isRecoveryPath,
  pathnameMatchesRole,
  safeRedirectPath,
  shouldRedirectSignedInUserFromAuthPath,
} from "@/lib/auth/redirects";
import { getUserRole } from "@/lib/auth/post-login";
import type { UserRole } from "@/lib/auth/roles";
import { withAuthCookieDomain } from "@/lib/domains";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(
            name,
            value,
            withAuthCookieDomain(options ?? {}),
          );
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const loginUrl = new URL("/login", request.url);

  if (!user && isDashboardPath(pathname)) {
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!user && isRecoveryPath(pathname)) {
    loginUrl.searchParams.set(
      "error",
      "Your reset link has expired. Please request a new one.",
    );
    return NextResponse.redirect(loginUrl);
  }

  if (!user) {
    return supabaseResponse;
  }

  const role: UserRole | null = user
    ? await getUserRole(supabase, user)
    : null;

  if (shouldRedirectSignedInUserFromAuthPath(pathname)) {
    if (!role) {
      // Signed in but no profile — stay on login/signup and show the error (no redirect loop).
      return supabaseResponse;
    }

    const next = request.nextUrl.searchParams.get("next");
    const destination =
      safeRedirectPath(next) ?? getDashboardPathForRole(role);
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (role && isDashboardPath(pathname) && !pathnameMatchesRole(pathname, role)) {
    return NextResponse.redirect(
      new URL(getDashboardPathForRole(role), request.url),
    );
  }

  return supabaseResponse;
}
