/**
 * Preferred display label for a profile row or auth user.
 */
export function resolveProfileDisplayName(
  fullName: string | null | undefined,
  email: string | null | undefined,
  fallback = "User",
): string {
  const trimmed = fullName?.trim();
  if (trimmed) return trimmed;

  const mail = email?.trim();
  if (mail) {
    const local = mail.split("@")[0]?.trim();
    if (local) return local;
  }

  return fallback;
}

export function fullNameFromUserMetadata(
  metadata: Record<string, unknown> | undefined,
): string | null {
  const value = metadata?.full_name;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}
