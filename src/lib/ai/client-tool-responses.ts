import type { LmsAiSessionContext } from "@/lib/ai/lms-context";

/** Instant tool payloads from session context (avoids slow API round-trips). */
export function tryFastLmsToolResponse(
  segment: string,
  session: LmsAiSessionContext,
): string | null {
  const variables = session.dynamicVariables;
  const { role, displayName } = session;

  if (segment === "attendance" && role === "student") {
    return JSON.stringify({
      role: "student",
      note: "Based on weekday lesson and assignment activity in the LMS.",
      attendancePercent: Number(variables.attendance_percent ?? 0),
      streakDays: Number(variables.streak_days ?? 0),
    });
  }

  if (segment === "summary" && role === "student") {
    return JSON.stringify({
      role: "student",
      displayName,
      openAssignments: Number(variables.open_assignments ?? 0),
      attendancePercent: Number(variables.attendance_percent ?? 0),
      streakDays: Number(variables.streak_days ?? 0),
      unreadMessages: Number(variables.unread_messages ?? 0),
      averageGradePercent:
        variables.average_grade_percent != null
          ? Number(variables.average_grade_percent)
          : null,
      academicYear: String(variables.academic_year ?? ""),
    });
  }

  if (segment === "summary" && role === "parent") {
    return JSON.stringify({
      role: "parent",
      displayName,
      linkedChildrenCount: Number(variables.linked_children_count ?? 0),
      note: "Call other tools for per-child assignment, grade, schedule, and attendance details.",
    });
  }

  if (segment === "summary" && (role === "teacher" || role === "admin")) {
    return JSON.stringify({
      role,
      displayName,
      assignedCourses: Number(variables.assigned_courses ?? 0),
      pendingGrading: Number(variables.pending_grading ?? 0),
    });
  }

  return null;
}

const LMS_TOOL_SEGMENTS = [
  "summary",
  "assignments",
  "attendance",
  "schedule",
  "grades",
] as const;

export type LmsToolSegment = (typeof LMS_TOOL_SEGMENTS)[number];

export function isLmsToolSegment(value: string): value is LmsToolSegment {
  return (LMS_TOOL_SEGMENTS as readonly string[]).includes(value);
}

const responseCache = new Map<string, string>();

function cacheKey(segment: LmsToolSegment, userId: string) {
  return `${userId}:${segment}`;
}

export function warmLmsToolCache(userId: string) {
  for (const segment of LMS_TOOL_SEGMENTS) {
    void fetchLmsTool(segment, userId).catch(() => undefined);
  }
}

export async function fetchLmsTool(
  segment: LmsToolSegment,
  userId: string,
  session?: LmsAiSessionContext,
): Promise<string> {
  const fast = session ? tryFastLmsToolResponse(segment, session) : null;
  if (fast) return fast;

  const key = cacheKey(segment, userId);
  const cached = responseCache.get(key);
  if (cached) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch(`/api/ai/lms/${segment}`, {
      credentials: "same-origin",
      signal: controller.signal,
    });
    const payload = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      return JSON.stringify({
        error:
          typeof payload.error === "string"
            ? payload.error
            : "Unable to load LMS data.",
      });
    }

    const json = JSON.stringify(payload);
    responseCache.set(key, json);
    return json;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return JSON.stringify({
        error: "LMS data request timed out. Please try again.",
      });
    }
    return JSON.stringify({ error: "Network error while loading LMS data." });
  } finally {
    clearTimeout(timeout);
  }
}
