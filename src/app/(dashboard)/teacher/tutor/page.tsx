import { AalgoAiWorkspace } from "@/components/aalgo-ai/aalgo-ai-workspace";
import { loadTutorPageSession } from "@/lib/ai/load-tutor-session";

export default async function TeacherAalgoPage() {
  const session = await loadTutorPageSession("teacher", "/teacher/tutor");
  return <AalgoAiWorkspace audience="teacher" session={session} />;
}
