import { AalgoAiWorkspace } from "@/components/aalgo-ai/aalgo-ai-workspace";
import { loadTutorPageSession } from "@/lib/ai/load-tutor-session";

export default async function StudentTutorPage() {
  const session = await loadTutorPageSession("student", "/student/tutor");
  return <AalgoAiWorkspace audience="student" session={session} />;
}
