import { StudentLiveView } from "@/components/student/live-sessions-view";
import { fetchStudentLiveSessions, requireStudentId } from "@/lib/student/queries";

export default async function LiveClassesPage() {
  const studentId = await requireStudentId("/student/live");
  const sessions = await fetchStudentLiveSessions(studentId);
  return <StudentLiveView sessions={sessions} />;
}
