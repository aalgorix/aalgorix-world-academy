import { MessagingPanel } from "@/components/messages/messaging-panel";
import { fetchStudentMessageContacts } from "@/lib/messages/queries";
import { requireStudentId } from "@/lib/student/queries";

export default async function StudentMessagesPage() {
  const studentId = await requireStudentId("/student/messages");
  const contacts = await fetchStudentMessageContacts(studentId);

  return (
    <MessagingPanel
      contacts={contacts}
      viewerId={studentId}
      participantRole="student"
      revalidatePath="/student/messages"
      emptyTitle="No teachers to message yet"
      emptyDescription="Enroll in a course with an assigned teacher to start messaging."
    />
  );
}
