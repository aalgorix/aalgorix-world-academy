import { StudentAssessmentsView } from "@/components/student/assessments-view";
import { fetchStudentAssessments, requireStudentId } from "@/lib/student/queries";

export default async function AssessmentsPage() {
  const studentId = await requireStudentId("/student/assessments");
  const { assessments, subjectPerformance } = await fetchStudentAssessments(studentId);
  return (
    <StudentAssessmentsView
      assessments={assessments}
      subjectPerformance={subjectPerformance}
    />
  );
}
