import {
  isAuthPath,
  isDashboardPath,
} from "@/lib/auth/redirects";

/** Public marketing routes (served on the marketing origin in dual-domain mode). */
const MARKETING_PREFIXES = ["/courses", "/contact", "/faq", "/our-story", "/blog"] as const;

function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/**
 * Prefer server-only env (runtime on deploy) over NEXT_PUBLIC_* (inlined at build).
 * Do not use appUrl()/marketingUrl() in client components — use relative paths
 * like /login and let the proxy redirect using these origins.
 */
function readSiteOrigin(
  serverKey: "MARKETING_SITE_URL" | "APP_SITE_URL",
  publicKey: "NEXT_PUBLIC_MARKETING_URL" | "NEXT_PUBLIC_APP_URL",
  fallback: string,
): string {
  const server = process.env[serverKey]?.trim();
  if (server) {
    return stripTrailingSlash(server);
  }
  const fromPublic = process.env[publicKey]?.trim();
  if (fromPublic) {
    return stripTrailingSlash(fromPublic);
  }
  return fallback;
}

/** Canonical marketing site origin (www.aalgorixworldacademy.com in production). */
export function getMarketingOrigin(): string {
  return readSiteOrigin(
    "MARKETING_SITE_URL",
    "NEXT_PUBLIC_MARKETING_URL",
    "http://localhost:3000",
  );
}

/**
 * Authenticated app origin (app.aalgorixworldacademy.com in production).
 * Falls back to marketing origin when unset (local monolith dev).
 */
export function getAppOrigin(): string {
  const app = readSiteOrigin(
    "APP_SITE_URL",
    "NEXT_PUBLIC_APP_URL",
    "",
  );
  if (app) {
    return app;
  }
  return getMarketingOrigin();
}

/** True when marketing and app origins differ (production dual-domain). */
export function isDualDomainMode(): boolean {
  return getMarketingOrigin() !== getAppOrigin();
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

export function isMarketingHost(hostHeader: string): boolean {
  if (!isDualDomainMode()) {
    return true;
  }
  return hostsMatchConfiguredOrigin(hostHeader, getMarketingOrigin());
}

export function isAppHost(hostHeader: string): boolean {
  if (!isDualDomainMode()) {
    return false;
  }
  return hostsMatchConfiguredOrigin(hostHeader, getAppOrigin());
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

export function marketingUrl(path = ""): string {
  const origin = getMarketingOrigin();
  if (!path) {
    return origin;
  }
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function appUrl(path = ""): string {
  const origin = getAppOrigin();
  if (!path) {
    return origin;
  }
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Shared parent domain for Supabase auth cookies (e.g. `.aalgorixworldacademy.com`).
 * Set AUTH_COOKIE_DOMAIN in production so sessions work across subdomains.
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
