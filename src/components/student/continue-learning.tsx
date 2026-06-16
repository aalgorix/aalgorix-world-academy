import { BookOpen, Play } from "lucide-react";
import Link from "next/link";

type CourseMeta = {
  courseId: string;
  title: string;
  subtitle: string;
  progressPercent: number;
  classroomHref: string | null;
  thumbnailUrl: string | null;
};

interface ContinueLearningProps {
  courses: CourseMeta[];
}

// Color palette cycling for unlabelled courses
const PALETTE = [
  {
    grad: "linear-gradient(135deg,#6E8BFF,#3B5BFF)",
    bg: "#EDF1FF",
    solid: "#4F6BFF",
  },
  {
    grad: "linear-gradient(135deg,#34D399,#0E9F6E)",
    bg: "#E7F8F1",
    solid: "#10B981",
  },
  {
    grad: "linear-gradient(135deg,#FBBF24,#F59E0B)",
    bg: "#FEF3E2",
    solid: "#F59E0B",
  },
  {
    grad: "linear-gradient(135deg,#A78BFA,#7C3AED)",
    bg: "#F3EEFE",
    solid: "#8B5CF6",
  },
  {
    grad: "linear-gradient(135deg,#22D3EE,#0891B2)",
    bg: "#E2F7FB",
    solid: "#06B6D4",
  },
  {
    grad: "linear-gradient(135deg,#FB7185,#E11D48)",
    bg: "#FEECEF",
    solid: "#F43F5E",
  },
];

export function ContinueLearning({ courses }: ContinueLearningProps) {
  if (courses.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="text-[17px] font-extrabold text-[#1A1B2E]">
            Continue learning
          </div>
        </div>
        <div className="rounded-xl border border-dashed border-[#D6D8E4] bg-[#FAFAFA] px-6 py-10 text-center">
          <BookOpen className="w-8 h-8 text-[#C4C7D9] mx-auto mb-3" />
          <p className="text-[14px] font-semibold text-[#41435F]">
            No active enrollments yet
          </p>
          <p className="mt-1 text-[12.5px] text-[#9AA0B8]">
            Your courses will appear here once enrolled.
          </p>
          <Link
            href="/courses"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-[11px] text-[13px] font-bold text-[#5B5BF0] bg-[#EEF0FF] transition-colors hover:bg-[#E0E3FF]"
          >
            Browse curricula
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3.5">
        <div className="text-[17px] font-extrabold text-[#1A1B2E]">
          Continue learning
        </div>
        <Link
          href="/student/courses"
          className="text-[12.5px] font-bold text-[#5B5BF0] bg-transparent border-none transition-colors hover:text-indigo-800"
        >
          See all courses
        </Link>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))" }}>
        {courses.map(
          ({ courseId, title, subtitle, progressPercent, classroomHref, thumbnailUrl }, idx) => {
            const palette = PALETTE[idx % PALETTE.length];

            return (
              <div
                key={courseId}
                className="bg-white border border-[#ECEDF3] rounded-[20px] overflow-hidden flex flex-col"
                style={{
                  boxShadow:
                    "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)",
                }}
              >
                {/* course header */}
                <div
                  className="h-[84px] relative flex items-center px-4"
                  style={{ background: palette.grad }}
                >
                  <div
                    aria-hidden
                    className="absolute -top-5 -right-3.5 w-[78px] h-[78px] rounded-full"
                    style={{ background: "rgba(255,255,255,.16)" }}
                  />
                  {thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbnailUrl}
                      alt=""
                      className="w-[44px] h-[44px] rounded-[13px] object-cover"
                    />
                  ) : (
                    <div
                      className="w-[44px] h-[44px] rounded-[13px] flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,.22)", backdropFilter: "blur(4px)" }}
                    >
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <span
                    className="absolute top-3 right-3 text-[11px] font-bold text-white px-2 py-1 rounded-full"
                    style={{ background: "rgba(0,0,0,.16)" }}
                  >
                    {progressPercent}%
                  </span>
                </div>

                {/* course body */}
                <div className="p-4 flex flex-col gap-2.5 flex-1">
                  <div>
                    <div className="text-[15px] font-bold text-[#1A1B2E]">
                      {title}
                    </div>
                    <div className="text-[11.5px] font-medium text-[#9AA0B8] mt-0.5 truncate">
                      {subtitle}
                    </div>
                  </div>

                  {/* progress bar */}
                  <div className="h-[7px] bg-[#EEF0F5] rounded-full overflow-hidden mt-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progressPercent}%`,
                        background: palette.grad,
                      }}
                    />
                  </div>

                  {classroomHref ? (
                    <Link
                      href={classroomHref}
                      className="mt-auto flex items-center justify-center gap-1.5 text-[13px] font-bold px-3 py-2.5 rounded-[11px] transition-colors"
                      style={{ background: palette.bg, color: palette.solid }}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Continue
                    </Link>
                  ) : (
                    <p className="mt-auto text-center text-[11.5px] font-medium text-[#9AA0B8]">
                      Publishing soon
                    </p>
                  )}
                </div>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}
