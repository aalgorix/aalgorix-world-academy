import { Mail } from "lucide-react";
import { Suspense } from "react";

import { NoChildrenPrompt } from "@/components/parent/no-children-prompt";
import { ParentChildNav } from "@/components/parent/parent-child-nav";
import {
  fetchChildTeacherContacts,
  requireParentSession,
  resolveActiveChildId,
} from "@/lib/parent/queries";

type PageProps = {
  searchParams: Promise<{ child?: string }>;
};

export default async function ParentMessagesPage({ searchParams }: PageProps) {
  const { child: childParam } = await searchParams;
  const session = await requireParentSession("/parent/messages");
  const activeChildId = resolveActiveChildId(session.children, childParam, "/parent/messages");

  const contacts = activeChildId ? await fetchChildTeacherContacts(activeChildId) : [];

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 1320, padding: "28px 32px 80px" }}>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-stone-900">Teachers</h1>
        <p className="mt-1 text-[14px] font-medium text-stone-500">
          Course teachers assigned to your child&apos;s enrolled subjects.
        </p>
      </div>

      {session.children.length === 0 ? (
        <NoChildrenPrompt />
      ) : activeChildId ? (
        <>
          <Suspense fallback={null}>
            <ParentChildNav linkedChildren={session.children} activeChildId={activeChildId} />
          </Suspense>

          {contacts.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-stone-300 bg-white px-8 py-16 text-center">
              <p className="text-[16px] font-bold text-stone-800">No teachers assigned yet</p>
              <p className="mt-2 text-[13px] text-stone-500">
                Teachers appear here once they are assigned to your child&apos;s courses.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {contacts.map((contact) => (
                <div
                  key={`${contact.teacherId}-${contact.courseTitle}`}
                  className="bg-white border border-stone-200 rounded-[20px] p-5 flex flex-col gap-4"
                  style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04)" }}
                >
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600">
                      {contact.courseTitle}
                    </div>
                    <div className="mt-1 text-[16px] font-extrabold text-stone-900">
                      {contact.teacherName}
                    </div>
                    <div className="text-[13px] text-stone-500">{contact.teacherEmail}</div>
                  </div>
                  <a
                    href={`mailto:${contact.teacherEmail}?subject=${encodeURIComponent(`Regarding ${contact.courseTitle}`)}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[12px] text-[13px] font-bold text-white hover:opacity-90 transition-opacity"
                    style={{ background: "linear-gradient(135deg,#D97706,#B45309)" }}
                  >
                    <Mail size={15} />
                    Email teacher
                  </a>
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
