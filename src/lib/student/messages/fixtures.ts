import type { LoungeChatMessage } from "@/lib/student/messages/types";

export function buildBatchThreadMessages(
  batchLabel: string,
  displayName: string,
): LoungeChatMessage[] {
  const firstName = displayName.split(" ")[0] || "Student";
  return [
    {
      id: "batch-welcome",
      authorName: "Cohort Moderator",
      body: `Welcome to the ${batchLabel} batch channel. Use this space for schedule questions and peer support.`,
      sentAtIso: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      isSelf: false,
    },
    {
      id: "batch-peer-1",
      authorName: "Peer Learner",
      body: "Does anyone have the Module 2 worksheet link from the study vault?",
      sentAtIso: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      isSelf: false,
    },
    {
      id: "batch-self-1",
      authorName: "You",
      body: `Hi team — it's ${firstName}. I'll share notes after today's live session.`,
      sentAtIso: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      isSelf: true,
    },
  ];
}

export function buildTeacherThreadMessages(
  teacherName: string,
  courseTitle: string,
  displayName: string,
): LoungeChatMessage[] {
  const firstName = displayName.split(" ")[0] || "there";
  return [
    {
      id: "teacher-intro",
      authorName: teacherName,
      body: `Hello ${firstName} — I'm your grading instructor for ${courseTitle}. Message me here for assignment feedback.`,
      sentAtIso: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      isSelf: false,
    },
  ];
}
