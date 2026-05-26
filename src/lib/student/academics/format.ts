export function formatVideoDuration(seconds: number | null | undefined): string {
  if (seconds == null || seconds <= 0) return "Duration pending";
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export function formatTurnInLabel(
  submittedAtIso: string | null,
  dueAtIso: string | null,
): string {
  if (submittedAtIso) {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(submittedAtIso));
  }
  if (dueAtIso) {
    return `Due ${new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(new Date(dueAtIso))}`;
  }
  return "Not yet submitted";
}

export function lessonMilestoneLabel(completed: boolean): string {
  return completed ? "Milestone complete" : "In progress";
}
