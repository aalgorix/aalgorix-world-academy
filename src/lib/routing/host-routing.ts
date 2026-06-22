import { type NextRequest, NextResponse } from "next/server";

import {
  getMarketingOrigin,
  getRequestHost,
  hostFromOrigin,
  hostsMatchConfiguredOrigin,
  normalizeHost,
} from "@/lib/domains";

/**
 * Redirects apex ↔ www to the canonical host in MARKETING_SITE_URL.
 */
export function resolveCanonicalHostRedirect(
  request: NextRequest,
): NextResponse | null {
  const host = normalizeHost(getRequestHost(request));
  const { pathname, search } = request.nextUrl;
  const pathWithSearch = `${pathname}${search}`;

  const marketingOrigin = getMarketingOrigin();
  const marketingHost = hostFromOrigin(marketingOrigin);

  if (
    hostsMatchConfiguredOrigin(host, marketingOrigin) &&
    host !== marketingHost
  ) {
    return NextResponse.redirect(new URL(pathWithSearch, marketingOrigin));
  }

  return null;
}
