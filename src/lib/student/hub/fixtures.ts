import type {
  HubAnnouncement,
  HubLiveSession,
  HubNewsCard,
} from "@/lib/student/hub/types";

/** Term-wide scheduled live lectures used as attendance denominator. */
export const EXPECTED_LECTURES_PER_TERM = 16;

function nextWeekdayAt(hour: number, minute: number): Date {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  while (target.getDay() === 0 || target.getDay() === 6) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}

export function buildDefaultLiveSession(
  courseTitle: string,
  courseId: string | null,
): HubLiveSession {
  const startsAt = nextWeekdayAt(10, 0);
  return {
    id: "next-live-lecture",
    title: `Live Masterclass — ${courseTitle || "Academic Cohort"}`,
    courseId,
    courseTitle: courseTitle || "General Studies",
    startsAtIso: startsAt.toISOString(),
    joinUrl: courseId ? `/student/courses/${courseId}` : "/student",
  };
}

export const PLATFORM_ANNOUNCEMENTS: HubAnnouncement[] = [
  {
    id: "ann-1",
    title: "Mid-term assessment window opens Friday",
    body: "Formal tests for enrolled CAPS tracks unlock in your Assignments tab at 08:00 SAST.",
    postedAtIso: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    authorLabel: "Academic Operations",
  },
  {
    id: "ann-2",
    title: "Study vault refresh — new printable worksheets",
    body: "Teachers uploaded supplemental PDF packs for Module 2 across active STEM enrollments.",
    postedAtIso: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    authorLabel: "Faculty Desk",
  },
  {
    id: "ann-3",
    title: "Parent linkage codes rotate every 24 hours",
    body: "Generate a fresh secure code from Profile if your guardian needs dashboard access.",
    postedAtIso: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
    authorLabel: "Platform Admin",
  },
];

export const CURATED_NEWS_CARDS: HubNewsCard[] = [
  {
    id: "news-1",
    title: "UNESCO spotlights AI literacy in secondary schools",
    summary: "Global policy brief urges ethical AI modules alongside traditional STEM pathways.",
    category: "EdTech Policy",
    imageGradient: "from-indigo-500 to-violet-600",
    externalUrl: "https://www.unesco.org",
  },
  {
    id: "news-2",
    title: "Cambridge revises 2026 sciences practical rubric",
    summary: "New emphasis on data interpretation and collaborative lab reporting.",
    category: "Curriculum",
    imageGradient: "from-emerald-500 to-teal-600",
    externalUrl: "https://www.cambridgeinternational.org",
  },
  {
    id: "news-3",
    title: "Africa climate summit: youth innovation grants",
    summary: "Regional fund opens for student-led sustainability capstone projects.",
    category: "Current Affairs",
    imageGradient: "from-amber-500 to-orange-600",
    externalUrl: "https://au.int",
  },
];

export const DEFAULT_COHORT_MESSAGES = [
  {
    id: "cohort-1",
    authorName: "Mentor Bot",
    body: "Welcome to your batch channel — share questions before tomorrow's live session.",
    sentAtIso: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    isSelf: false,
  },
  {
    id: "cohort-2",
    authorName: "You",
    body: "Will the worksheet for Module 2 be in the Study Vault?",
    sentAtIso: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    isSelf: true,
  },
];
