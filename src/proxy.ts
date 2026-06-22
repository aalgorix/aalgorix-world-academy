import { type NextRequest } from "next/server";

import { resolveCanonicalHostRedirect } from "@/lib/routing/host-routing";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const canonical = resolveCanonicalHostRedirect(request);
  if (canonical) {
    return canonical;
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on all routes except static assets and images.
     * Required so Supabase auth cookies refresh on every navigation.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
