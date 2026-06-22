import {
  isAuthPath,
  isDashboardPath,
} from "@/lib/auth/redirects";

/** Public marketing routes (same origin as auth/dashboard in single-domain mode). */
const MARKETING_PREFIXES = ["/courses", "/contact", "/faq", "/our-story", "/blog"] as const;

function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/**
 * Prefer server-only env (runtime on deploy) over NEXT_PUBLIC_* (inlined at build).
 * Use relative paths in client components; server code uses siteUrl() when an absolute URL is needed.
 */
function readSiteOrigin(): string {
  const server = process.env.MARKETING_SITE_URL?.trim();
  if (server) {
    return stripTrailingSlash(server);
  }
  const fromPublic = process.env.NEXT_PUBLIC_MARKETING_URL?.trim();
  if (fromPublic) {
    return stripTrailingSlash(fromPublic);
  }
  return "http://localhost:3000";
}

/** Canonical site origin (www.aalgorixworldacademy.com in production). */
export function getMarketingOrigin(): string {
  return readSiteOrigin();
}

/** Alias for getMarketingOrigin — marketing and LMS share one host. */
export function getAppOrigin(): string {
  return getMarketingOrigin();
}

export function normalizeHost(hostHeader: string): string {
  const host = hostHeader.split(",")[0]?.trim().toLowerCase() ?? "";
  const portIndex = host.lastIndexOf(":");
  if (portIndex > -1 && !host.includes("]")) {
    return host.slice(0, portIndex);
  }
  return host;
}

export function hostFromOrigin(origin: string): string {
  return normalizeHost(new URL(origin).host);
}

/** Strips a leading `www.` so apex and www hosts compare equal. */
export function stripWww(host: string): string {
  const normalized = normalizeHost(host);
  return normalized.startsWith("www.") ? normalized.slice(4) : normalized;
}

/** True when the request host matches a configured origin (www and apex equivalent). */
export function hostsMatchConfiguredOrigin(
  requestHost: string,
  origin: string,
): boolean {
  const host = normalizeHost(requestHost);
  const configured = hostFromOrigin(origin);
  if (host === configured) {
    return true;
  }
  return stripWww(host) === stripWww(configured);
}

export function getRequestHost(request: { headers: Headers }): string {
  return (
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    ""
  );
}

export function isMarketingPath(pathname: string): boolean {
  if (pathname === "/") {
    return false;
  }
  return MARKETING_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isAppPath(pathname: string): boolean {
  return isAuthPath(pathname) || isDashboardPath(pathname);
}

export function siteUrl(path = ""): string {
  const origin = getMarketingOrigin();
  if (!path) {
    return origin;
  }
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function marketingUrl(path = ""): string {
  return siteUrl(path);
}

export function appUrl(path = ""): string {
  return siteUrl(path);
}

/**
 * Shared parent domain for Supabase auth cookies (e.g. `.aalgorixworldacademy.com`).
 * Set AUTH_COOKIE_DOMAIN in production so sessions work on www and apex.
 */
export function getAuthCookieDomain(): string | undefined {
  const domain = process.env.AUTH_COOKIE_DOMAIN?.trim();
  return domain || undefined;
}

export function withAuthCookieDomain<T extends { domain?: string }>(
  options: T,
): T {
  const domain = getAuthCookieDomain();
  if (!domain) {
    return options;
  }
  return { ...options, domain };
}
