import { AalgoAiWorkspace } from "@/components/aalgo-ai/aalgo-ai-workspace";
import { loadTutorPageSession } from "@/lib/ai/load-tutor-session";

export default async function ParentAalgoPage() {
  const session = await loadTutorPageSession("parent", "/parent/tutor");
  return <AalgoAiWorkspace audience="parent" session={session} />;
}
