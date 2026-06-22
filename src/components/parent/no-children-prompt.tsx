import Link from "next/link";

export function NoChildrenPrompt() {
  return (
    <div className="rounded-[22px] border border-dashed border-stone-300 bg-white px-8 py-16 text-center">
      <p className="text-[18px] font-extrabold text-stone-900">No linked students yet</p>
      <p className="mt-2 text-[14px] text-stone-600 max-w-md mx-auto">
        Ask your child to generate a link code in their student settings, then enter it in family
        settings to start monitoring their progress.
      </p>
      <Link
        href="/parent/settings"
        className="inline-flex mt-6 px-5 py-2.5 rounded-[12px] text-[13.5px] font-bold text-white hover:opacity-90 transition-opacity"
        style={{ background: "linear-gradient(135deg,#D97706,#B45309)" }}
      >
        Link a student →
      </Link>
    </div>
  );
}
