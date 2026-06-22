import { MessagingPanel } from "@/components/messages/messaging-panel";
import { fetchTeacherMessageContacts } from "@/lib/messages/queries";
import { requireTeacherId } from "@/lib/teacher/queries";

export default async function TeacherMessagesPage() {
  const teacherId = await requireTeacherId("/teacher/messages");
  const contacts = await fetchTeacherMessageContacts(teacherId);

  return (
    <MessagingPanel
      contacts={contacts}
      viewerId={teacherId}
      participantRole="teacher"
      revalidatePath="/teacher/messages"
      emptyTitle="No students to message yet"
      emptyDescription="Students enrolled in your assigned courses will appear here."
    />
  );
}
