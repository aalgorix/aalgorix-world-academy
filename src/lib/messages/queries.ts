import { unwrapOne } from "@/lib/dashboard/relations";
import { createClient } from "@/lib/supabase/server";

export type MessageRow = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export type ConversationContact = {
  conversationId: string | null;
  courseId: string;
  courseTitle: string;
  peerId: string;
  peerName: string;
  peerRole: string;
  peerInitials: string;
  accentColor: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: MessageRow[];
};

const ACCENT_PALETTE = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#A78BFA",
  "#FB7185",
  "#06B6D4",
  "#0D9488",
];

function initialsFromName(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString(undefined, { weekday: "short" });
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function countUnread(messages: MessageRow[], viewerId: string): number {
  const lastOwnIndex = [...messages].reverse().findIndex((m) => m.senderId === viewerId);
  if (lastOwnIndex === -1) {
    return messages.filter((m) => m.senderId !== viewerId).length;
  }
  const lastOwnPos = messages.length - 1 - lastOwnIndex;
  return messages.slice(lastOwnPos + 1).filter((m) => m.senderId !== viewerId).length;
}

type RawMessage = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

type RawConversation = {
  id: string;
  course_id: string;
  student_id: string;
  teacher_id: string;
  updated_at: string;
  courses: { title: string } | { title: string }[] | null;
  student: { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null;
  teacher: { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null;
  messages: RawMessage[] | null;
};

function mapMessages(rows: RawMessage[] | null | undefined): MessageRow[] {
  return (rows ?? [])
    .map((m) => ({
      id: m.id,
      senderId: m.sender_id,
      body: m.body,
      createdAt: m.created_at,
    }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function fetchStudentMessageContacts(
  studentId: string,
): Promise<ConversationContact[]> {
  const supabase = await createClient();

  const { data: enrollmentRows } = await supabase
    .from("enrollments")
    .select("courses ( id, title )")
    .eq("student_id", studentId)
    .eq("status", "active");

  const courses = (enrollmentRows ?? []).flatMap((row) => {
    const c = unwrapOne(
      row.courses as { id: string; title: string } | { id: string; title: string }[] | null,
    );
    return c ? [c] : [];
  });

  if (courses.length === 0) return [];

  const courseIds = courses.map((c) => c.id);
  const courseTitleById = new Map(courses.map((c) => [c.id, c.title]));

  const [{ data: teacherAssignments, error: assignmentError }, { data: conversationRows, error: conversationError }] = await Promise.all([
    supabase
      .from("teacher_course_assignments")
      .select("teacher_id, course_id")
      .in("course_id", courseIds),
    supabase
      .from("conversations")
      .select(
        `id, course_id, student_id, teacher_id, updated_at,
         courses ( title ),
         student:profiles!student_id ( full_name, email ),
         teacher:profiles!teacher_id ( full_name, email ),
         messages ( id, sender_id, body, created_at )`,
      )
      .eq("student_id", studentId)
      .in("course_id", courseIds)
      .order("updated_at", { ascending: false }),
  ]);

  if (assignmentError) {
    console.error("[messages/student] teacher_course_assignments:", assignmentError.message);
  }
  if (conversationError) {
    console.error("[messages/student] conversations:", conversationError.message);
  }

  const teacherIds = [...new Set((teacherAssignments ?? []).map((r) => r.teacher_id))];
  const { data: teacherProfiles, error: profileError } =
    teacherIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", teacherIds)
      : { data: [], error: null };

  if (profileError) {
    console.error("[messages/student] teacher profiles:", profileError.message);
  }

  const profileById = new Map((teacherProfiles ?? []).map((p) => [p.id, p]));

  const conversationByKey = new Map<string, RawConversation>();
  for (const row of (conversationRows ?? []) as RawConversation[]) {
    conversationByKey.set(`${row.course_id}:${row.teacher_id}`, row);
  }

  const contacts: ConversationContact[] = [];
  const seen = new Set<string>();
  let colorIndex = 0;

  for (const row of teacherAssignments ?? []) {
    const key = `${row.course_id}:${row.teacher_id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const profile = profileById.get(row.teacher_id);
    if (!profile) continue;

    const conv = conversationByKey.get(key);
    const messages = mapMessages(conv?.messages);
    const last = messages[messages.length - 1];
    const peerName = profile.full_name?.trim() || "Teacher";

    contacts.push({
      conversationId: conv?.id ?? null,
      courseId: row.course_id,
      courseTitle: courseTitleById.get(row.course_id) ?? "Course",
      peerId: profile.id,
      peerName,
      peerRole: `${courseTitleById.get(row.course_id) ?? "Course"} teacher`,
      peerInitials: initialsFromName(peerName),
      accentColor: ACCENT_PALETTE[colorIndex++ % ACCENT_PALETTE.length]!,
      lastMessage: last?.body ?? "Start a conversation",
      lastTime: last ? formatMessageTime(last.createdAt) : "",
      unread: countUnread(messages, studentId),
      messages,
    });
  }

  return contacts.sort((a, b) => {
    if (a.unread !== b.unread) return b.unread - a.unread;
    const aTime = a.messages[a.messages.length - 1]?.createdAt ?? "";
    const bTime = b.messages[b.messages.length - 1]?.createdAt ?? "";
    return bTime.localeCompare(aTime);
  });
}

export async function fetchTeacherMessageContacts(
  teacherId: string,
): Promise<ConversationContact[]> {
  const supabase = await createClient();

  const { data: assignmentRows } = await supabase
    .from("teacher_course_assignments")
    .select("course_id, courses ( id, title )")
    .eq("teacher_id", teacherId);

  const courses = (assignmentRows ?? []).flatMap((row) => {
    const c = unwrapOne(
      row.courses as { id: string; title: string } | { id: string; title: string }[] | null,
    );
    return c ? [c] : [];
  });

  if (courses.length === 0) return [];

  const courseIds = courses.map((c) => c.id);
  const courseTitleById = new Map(courses.map((c) => [c.id, c.title]));

  const [{ data: enrollmentRows }, { data: conversationRows }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("student_id, course_id, student:profiles!student_id ( full_name, email )")
      .in("course_id", courseIds)
      .eq("status", "active"),
    supabase
      .from("conversations")
      .select(
        `id, course_id, student_id, teacher_id, updated_at,
         courses ( title ),
         student:profiles!student_id ( full_name, email ),
         teacher:profiles!teacher_id ( full_name, email ),
         messages ( id, sender_id, body, created_at )`,
      )
      .eq("teacher_id", teacherId)
      .in("course_id", courseIds)
      .order("updated_at", { ascending: false }),
  ]);

  const conversationByKey = new Map<string, RawConversation>();
  for (const row of (conversationRows ?? []) as RawConversation[]) {
    conversationByKey.set(`${row.course_id}:${row.student_id}`, row);
  }

  const contacts: ConversationContact[] = [];
  const seen = new Set<string>();
  let colorIndex = 0;

  for (const row of enrollmentRows ?? []) {
    const key = `${row.course_id}:${row.student_id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const student = unwrapOne(
      row.student as { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null,
    );
    if (!student) continue;

    const conv = conversationByKey.get(key);
    const messages = mapMessages(conv?.messages);
    const last = messages[messages.length - 1];
    const peerName = student.full_name?.trim() || student.email;

    contacts.push({
      conversationId: conv?.id ?? null,
      courseId: row.course_id as string,
      courseTitle: courseTitleById.get(row.course_id as string) ?? "Course",
      peerId: row.student_id as string,
      peerName,
      peerRole: `Student — ${courseTitleById.get(row.course_id as string) ?? "Course"}`,
      peerInitials: initialsFromName(peerName),
      accentColor: ACCENT_PALETTE[colorIndex++ % ACCENT_PALETTE.length]!,
      lastMessage: last?.body ?? "No messages yet",
      lastTime: last ? formatMessageTime(last.createdAt) : "",
      unread: countUnread(messages, teacherId),
      messages,
    });
  }

  return contacts.sort((a, b) => {
    if (a.unread !== b.unread) return b.unread - a.unread;
    const aTime = a.messages[a.messages.length - 1]?.createdAt ?? "";
    const bTime = b.messages[b.messages.length - 1]?.createdAt ?? "";
    return bTime.localeCompare(aTime);
  });
}
