import { StudentCalendarView } from "@/components/student/calendar-view";
import {
  fetchStudentCalendarEvents,
  requireStudentId,
} from "@/lib/student/queries";

export default async function CalendarPage() {
  const studentId = await requireStudentId("/student/calendar");
  const events = await fetchStudentCalendarEvents(studentId);
  return <StudentCalendarView events={events} />;
}
