import { fetchLmsSchedule } from "@/lib/ai/lms-context";
import { getLmsApiSession, isLmsApiSession } from "@/lib/ai/require-lms-api-session";

export async function GET() {
  const result = await getLmsApiSession();
  if (!isLmsApiSession(result)) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  const data = await fetchLmsSchedule(result.session);
  return Response.json(data);
}
