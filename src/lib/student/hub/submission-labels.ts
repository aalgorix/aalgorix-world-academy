import type { SubmissionStatus } from "@/lib/dashboard/submission-status";

export function hubSubmissionStatusLabel(status: SubmissionStatus): string {
  switch (status) {
    case "submitted":
      return "Awaiting Review";
    case "graded":
      return "Graded";
    case "returned":
      return "Revision Requested";
    case "draft":
      return "Draft";
    default:
      return status;
  }
}

export function hubSubmissionBadgeClass(status: SubmissionStatus): string {
  switch (status) {
    case "submitted":
      return "bg-amber-50 text-amber-900 ring-amber-200";
    case "graded":
      return "bg-emerald-50 text-emerald-900 ring-emerald-200";
    case "returned":
      return "bg-rose-50 text-rose-900 ring-rose-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

export function inferAssignmentKind(title: string): "homework" | "test" {
  return /\b(test|exam|quiz|assessment)\b/i.test(title) ? "test" : "homework";
}
