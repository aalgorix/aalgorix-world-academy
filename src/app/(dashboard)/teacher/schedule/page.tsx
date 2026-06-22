import { TeacherScheduleView } from "@/components/teacher/schedule-view";
import {
  fetchTeacherScheduleEvents,
  requireTeacherId,
} from "@/lib/teacher/queries";

export default async function TeacherSchedulePage() {
  const teacherId = await requireTeacherId("/teacher/schedule");
  const events = await fetchTeacherScheduleEvents(teacherId);
  return <TeacherScheduleView events={events} />;
}
