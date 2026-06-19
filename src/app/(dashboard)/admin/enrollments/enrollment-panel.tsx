"use client";

import { BookOpen, Loader2, Trash2, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { enrollStudentAction, removeEnrollmentAction, updateEnrollmentStatusAction } from "./actions";

export type StudentOption = { id: string; name: string };
export type CourseOption  = { id: string; title: string };
export type EnrollmentRow = {
  id: string;
  studentId: string;
  studentName: string;
  courseTitle: string;
  status: string;
  enrolledAt: string | null;
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  active:    { bg: "#D1FAE5", color: "#065F46" },
  pending:   { bg: "#FEF3C7", color: "#B45309" },
  paused:    { bg: "#E2E8F0", color: "#475569" },
  cancelled: { bg: "#FEE2E2", color: "#B91C1C" },
  completed: { bg: "#DBEAFE", color: "#1D4ED8" },
};

const STATUS_OPTIONS = ["active", "pending", "paused", "cancelled", "completed"] as const;

// ── Enroll modal ──────────────────────────────────────────────────────────────

function EnrollModal({
  students,
  courses,
  onClose,
  onDone,
}: {
  students: StudentOption[];
  courses:  CourseOption[];
  onClose:  () => void;
  onDone:   () => void;
}) {
  const [studentId, setStudentId] = useState("");
  const [courseId,  setCourseId]  = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);

  const selectedStudent = students.find((s) => s.id === studentId);
  const selectedCourse  = courses.find((c)  => c.id === courseId);

  async function handleEnroll() {
    if (!studentId || !courseId) {
      setError("Please select both a student and a course.");
      return;
    }
    setError(null);
    setLoading(true);
    const result = await enrollStudentAction(studentId, courseId);
    setLoading(false);
    if (!result.success) { setError(result.error); return; }
    setSuccess(true);
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-[480px] bg-white rounded-[24px] shadow-[0_24px_64px_rgba(0,0,0,.22)] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[11px] flex items-center justify-center bg-violet-100">
              <UserPlus className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold text-slate-900">Enroll student</h2>
              <p className="text-[12px] text-slate-500">Assign a student to a published course.</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Success */}
        {success ? (
          <div className="px-7 py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-[18px] font-extrabold text-slate-900 mb-1">Enrollment created!</h3>
            <p className="text-[13.5px] text-slate-500 mb-6">
              <strong>{selectedStudent?.name}</strong> is now enrolled in <strong>{selectedCourse?.title}</strong>.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setSuccess(false); setStudentId(""); setCourseId(""); }}
                className="px-5 py-2.5 rounded-[12px] border border-slate-200 text-[13.5px] font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                Enroll another
              </button>
              <button onClick={onClose}
                className="px-5 py-2.5 rounded-[12px] text-[13.5px] font-bold text-white hover:opacity-90 transition-opacity"
                style={{ background: "#7C3AED" }}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="px-7 py-5 flex flex-col gap-5">

            {/* Student picker */}
            <div>
              <label className="block text-[12.5px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                Student
              </label>
              {students.length === 0 ? (
                <p className="text-[13px] text-slate-400 italic">No student accounts found. Create one first.</p>
              ) : (
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full border border-slate-200 rounded-[12px] px-4 py-2.5 text-[13.5px] font-medium text-slate-900 outline-none focus:border-violet-400 transition-colors bg-white"
                >
                  <option value="">— Select a student —</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Course picker */}
            <div>
              <label className="block text-[12.5px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                Course
              </label>
              {courses.length === 0 ? (
                <p className="text-[13px] text-slate-400 italic">No published courses found. Publish a course first.</p>
              ) : (
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full border border-slate-200 rounded-[12px] px-4 py-2.5 text-[13.5px] font-medium text-slate-900 outline-none focus:border-violet-400 transition-colors bg-white"
                >
                  <option value="">— Select a course —</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Preview pill */}
            {studentId && courseId && (
              <div className="flex items-center gap-3 rounded-[14px] bg-violet-50 border border-violet-200 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-[12px] font-extrabold shrink-0">
                  {selectedStudent?.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="text-[13px] text-violet-900">
                  <strong>{selectedStudent?.name}</strong> will be enrolled in <strong>{selectedCourse?.title}</strong>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3 pb-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-[12px] border border-slate-200 text-[13.5px] font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                type="button"
                disabled={loading || !studentId || !courseId}
                onClick={handleEnroll}
                className="flex-1 py-2.5 rounded-[12px] text-[13.5px] font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                style={{ background: "#7C3AED" }}
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? "Enrolling…" : "Enroll student"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Status select (per row) ───────────────────────────────────────────────────

function StatusSelect({ enrollmentId, currentStatus }: { enrollmentId: string; currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleChange(next: string) {
    if (next === currentStatus) return;
    setLoading(true);
    const result = await updateEnrollmentStatusAction(enrollmentId, next);
    setLoading(false);
    if (!result.success) {
      alert(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <select
      value={currentStatus}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value)}
      className="text-[11.5px] font-bold px-2 py-1 rounded-full border-0 outline-none cursor-pointer capitalize disabled:opacity-60"
      style={{
        background: (STATUS_STYLE[currentStatus] ?? STATUS_STYLE.active).bg,
        color: (STATUS_STYLE[currentStatus] ?? STATUS_STYLE.active).color,
      }}
    >
      {STATUS_OPTIONS.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}

// ── Remove button (per row) ───────────────────────────────────────────────────

function RemoveButton({ enrollmentId }: { enrollmentId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading,    setLoading]    = useState(false);
  const router = useRouter();

  async function handleRemove() {
    setLoading(true);
    const result = await removeEnrollmentAction(enrollmentId);
    setLoading(false);
    if (!result.success) { alert(result.error); return; }
    setConfirming(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <button onClick={() => setConfirming(false)}
          className="text-[11.5px] font-bold text-slate-500 hover:text-slate-700 px-2 py-1 rounded-[8px] hover:bg-slate-100 transition-colors">
          Cancel
        </button>
        <button onClick={handleRemove} disabled={loading}
          className="text-[11.5px] font-bold text-red-600 hover:text-red-700 px-2 py-1 rounded-[8px] hover:bg-red-50 transition-colors flex items-center gap-1 disabled:opacity-60">
          {loading && <Loader2 size={11} className="animate-spin" />}
          {loading ? "Removing…" : "Confirm remove"}
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirming(true)}
      className="w-7 h-7 rounded-[8px] flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
      title="Remove enrollment">
      <Trash2 size={14} />
    </button>
  );
}

// ── Main panel (exported) ─────────────────────────────────────────────────────

export function EnrollmentPanel({
  students,
  courses,
  enrollments,
  statusCounts,
}: {
  students:     StudentOption[];
  courses:      CourseOption[];
  enrollments:  EnrollmentRow[];
  statusCounts: Record<string, number>;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const router = useRouter();

  const visibleEnrollments =
    statusFilter === "all"
      ? enrollments
      : enrollments.filter((e) => e.status === statusFilter);

  return (
    <>
      {/* Header row */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Enrollments</h1>
          <p className="mt-1 text-[14px] font-medium text-slate-500">
            {enrollments.length} enrollment record{enrollments.length !== 1 ? "s" : ""} across all courses.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold text-white hover:opacity-90 transition-opacity"
          style={{ background: "#7C3AED" }}
        >
          <UserPlus size={15} />
          Enroll student
        </button>
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-3 mb-5">
        <button
          onClick={() => setStatusFilter("all")}
          className="flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] font-extrabold transition-colors"
          style={
            statusFilter === "all"
              ? { borderColor: "#7C3AED", background: "#EDE9FE", color: "#7C3AED" }
              : { borderColor: "#E2E8F0", background: "#fff", color: "#64748B" }
          }
        >
          All <span>{enrollments.length}</span>
        </button>
        {Object.entries(STATUS_STYLE).map(([status, s]) => {
          const count = statusCounts[status] ?? 0;
          if (count === 0) return null;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] font-extrabold capitalize transition-colors"
              style={
                statusFilter === status
                  ? { borderColor: s.color, background: s.bg, color: s.color }
                  : { borderColor: "#E2E8F0", background: "#fff", color: "#64748B" }
              }
            >
              {status} <span>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      {enrollments.length === 0 ? (
        <div className="bg-white rounded-[22px] border border-dashed border-slate-300 px-8 py-20 text-center">
          <UserPlus className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <p className="text-[17px] font-extrabold text-slate-900">No enrollments yet</p>
          <p className="mt-2 text-[13.5px] text-slate-500 mb-6">Use the button above to enroll your first student.</p>
          <button onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[13.5px] font-bold text-white hover:opacity-90 transition-opacity"
            style={{ background: "#7C3AED" }}>
            <UserPlus size={15} />
            Enroll a student
          </button>
        </div>
      ) : visibleEnrollments.length === 0 ? (
        <div className="bg-white rounded-[22px] border border-slate-200 px-8 py-16 text-center">
          <p className="text-[15px] font-bold text-slate-700">No enrollments match this filter.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[22px] overflow-hidden"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 6px 18px rgba(0,0,0,.03)" }}>
          <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            <span>Student</span>
            <span>Course</span>
            <span className="text-right">Status</span>
            <span className="text-right">Enrolled</span>
            <span />
          </div>

          <div className="divide-y divide-slate-50">
            {visibleEnrollments.map((e) => {
              const initials = e.studentName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
              const enrolled = e.enrolledAt
                ? new Date(e.enrolledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "—";

              return (
                <div key={e.id} className="flex sm:grid sm:grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-4 px-5 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-extrabold text-white shrink-0"
                      style={{ background: "#7C3AED" }}>
                      {initials}
                    </div>
                    <span className="text-[14px] font-bold text-slate-900 truncate">{e.studentName}</span>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 min-w-0">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[13.5px] text-slate-700 truncate">{e.courseTitle}</span>
                  </div>

                  <div className="text-right">
                    <StatusSelect enrollmentId={e.id} currentStatus={e.status} />
                  </div>

                  <div className="hidden sm:block text-right">
                    <span className="text-[12px] font-medium text-slate-500">{enrolled}</span>
                  </div>

                  <div className="flex justify-end">
                    <RemoveButton enrollmentId={e.id} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <EnrollModal
          students={students}
          courses={courses}
          onClose={() => setModalOpen(false)}
          onDone={() => { setModalOpen(false); router.refresh(); }}
        />
      )}
    </>
  );
}
