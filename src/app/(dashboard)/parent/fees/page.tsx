import { Suspense } from "react";

import { NoChildrenPrompt } from "@/components/parent/no-children-prompt";
import { ParentChildNav } from "@/components/parent/parent-child-nav";
import { requireParentSession, resolveActiveChildId } from "@/lib/parent/queries";

type PageProps = {
  searchParams: Promise<{ child?: string }>;
};

export default async function ParentFeesPage({ searchParams }: PageProps) {
  const { child: childParam } = await searchParams;
  const session = await requireParentSession("/parent/fees");
  const activeChildId = resolveActiveChildId(session.children, childParam, "/parent/fees");
  const activeChild = session.children.find((c) => c.id === activeChildId);

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 1320, padding: "28px 32px 80px" }}>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-stone-900">Fees & billing</h1>
        <p className="mt-1 text-[14px] font-medium text-stone-500">
          Enrollment and payment status for your family account.
        </p>
      </div>

      {session.children.length === 0 ? (
        <NoChildrenPrompt />
      ) : activeChild && activeChildId ? (
        <>
          <Suspense fallback={null}>
            <ParentChildNav linkedChildren={session.children} activeChildId={activeChildId} />
          </Suspense>

          <div className="rounded-[22px] border border-stone-200 bg-white p-8">
            <div className="max-w-lg">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600">
                {activeChild.full_name?.trim() || activeChild.email}
              </p>
              <h2 className="mt-2 text-[20px] font-extrabold text-stone-900">Admin-managed enrollment</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-stone-600">
                Course access is currently provisioned by the academy administration team. Online
                billing and invoice history will appear here when the payment gateway is enabled.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[14px] border border-stone-200 bg-stone-50 px-4 py-3">
                  <div className="text-[11px] font-bold uppercase text-stone-500">Enrollment</div>
                  <div className="mt-1 text-[15px] font-extrabold text-emerald-700">Active via admin</div>
                </div>
                <div className="rounded-[14px] border border-stone-200 bg-stone-50 px-4 py-3">
                  <div className="text-[11px] font-bold uppercase text-stone-500">Outstanding balance</div>
                  <div className="mt-1 text-[15px] font-extrabold text-stone-800">—</div>
                </div>
              </div>
              <p className="mt-6 text-[13px] text-stone-500">
                For billing questions, contact admissions through the{" "}
                <a href="/contact" className="font-semibold text-amber-700 hover:underline">
                  contact page
                </a>
                .
              </p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
