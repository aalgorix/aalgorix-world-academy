/** Client-safe auth links — always relative (single-domain deployment). */
export function appAuthHref(path = "/login"): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export function isExternalAuthHref(_href: string): boolean {
  return false;
}
