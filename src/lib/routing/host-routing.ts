import { type NextRequest, NextResponse } from "next/server";

import {
  appUrl,
  getAppOrigin,
  getMarketingOrigin,
  getRequestHost,
  hostFromOrigin,
  hostsMatchConfiguredOrigin,
  isAppHost,
  isAppPath,
  isDualDomainMode,
  isMarketingHost,
  isMarketingPath,
  marketingUrl,
  normalizeHost,
} from "@/lib/domains";

/**
 * Redirects www ↔ apex variants to the canonical host in MARKETING_SITE_URL / APP_SITE_URL.
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
    host !== marketingHost &&
    !isAppPath(pathname) &&
    !isAppHost(host)
  ) {
    return NextResponse.redirect(new URL(pathWithSearch, marketingOrigin));
  }

  if (!isDualDomainMode()) {
    return null;
  }

  const appOrigin = getAppOrigin();
  const appHost = hostFromOrigin(appOrigin);

  if (
    isAppHost(host) &&
    host !== appHost &&
    hostsMatchConfiguredOrigin(host, appOrigin)
  ) {
    return NextResponse.redirect(new URL(pathWithSearch, appOrigin));
  }

  return null;
}

/**
 * Redirects requests that hit the wrong production host for their route class.
 * Marketing pages → marketing origin; auth/dashboard → app origin.
 */
export function resolveCrossDomainRedirect(
  request: NextRequest,
): NextResponse | null {
  if (!isDualDomainMode()) {
    return null;
  }

  const host = getRequestHost(request);
  const { pathname, search } = request.nextUrl;

  if (isMarketingHost(host) && isAppPath(pathname)) {
    return NextResponse.redirect(new URL(`${pathname}${search}`, appUrl()));
  }

  if (isAppHost(host) && pathname !== "/" && isMarketingPath(pathname)) {
    return NextResponse.redirect(
      new URL(`${pathname}${search}`, marketingUrl()),
    );
  }

  return null;
}
