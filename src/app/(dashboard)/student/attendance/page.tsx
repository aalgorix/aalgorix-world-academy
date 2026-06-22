import { StudentAttendanceView } from "@/components/student/attendance-view";
import { fetchLearningActivity } from "@/lib/dashboard/learning-activity";
import { requireStudentId } from "@/lib/student/queries";

export default async function AttendancePage() {
  const studentId = await requireStudentId("/student/attendance");
  const activity = await fetchLearningActivity(studentId);
  return <StudentAttendanceView activity={activity} />;
}
