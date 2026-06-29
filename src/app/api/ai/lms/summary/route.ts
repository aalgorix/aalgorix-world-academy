import { getLmsApiSession, isLmsApiSession } from "@/lib/ai/require-lms-api-session";
import { fetchLmsSummary } from "@/lib/ai/lms-context";

export async function GET() {
  const result = await getLmsApiSession();
  if (!isLmsApiSession(result)) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  const data = await fetchLmsSummary(result.session);
  return Response.json(data);
}
