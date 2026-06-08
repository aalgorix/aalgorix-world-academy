/**
 * Client-safe auth link helper for marketing pages.
 * Uses NEXT_PUBLIC_* only — server redirects still apply via proxy when unset.
 */
export function appAuthHref(path = "/login"): string {
  const app = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (!app) {
    return path;
  }

  const marketing = process.env.NEXT_PUBLIC_MARKETING_URL?.trim().replace(/\/$/, "");
  if (marketing && app === marketing) {
    return path;
  }

  return `${app}${path.startsWith("/") ? path : `/${path}`}`;
}

export function isExternalAuthHref(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}
