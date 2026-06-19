"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { MarketingNav } from "../marketing-nav";

type HelpTopicId =
  | "admissions"
  | "general-enquiry"
  | "curriculum"
  | "fees-billing"
  | "technical-support"
  | "partnerships"
  | "other";

type HelpTopicOption = Readonly<{
  value: HelpTopicId;
  label: string;
}>;

type InquiryFormState = Readonly<{
  guardianName: string;
  email: string;
  phone: string;
  helpTopic: HelpTopicId | "";
  learningNotes: string;
}>;

const HELP_TOPICS: ReadonlyArray<HelpTopicOption> = [
  { value: "admissions", label: "Admissions & enrollment" },
  { value: "general-enquiry", label: "General enquiry" },
  { value: "curriculum", label: "Curriculum & academic pathways" },
  { value: "fees-billing", label: "Fees & tuition enquiry" },
  { value: "technical-support", label: "Technical & platform support" },
  { value: "partnerships", label: "Partnerships & media" },
  { value: "other", label: "Something else" },
] as const;

const SALES_EMAIL = "awa@aalgorix.com";
const CONTACT_PHONE_DISPLAY = "+91 91674 95565";
const CONTACT_PHONE_HREF = "+919167495565";
const VISIT_CITY_LINE = "Greater Noida, UP 201308";
const VISIT_ADDRESS_LINE =
  "Vision Spaces, A-Block (4th Floor), Vision Business Park, Plot No. 21, Knowledge Park 3";

const INPUT_CLASS =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

const LABEL_CLASS = "text-xs font-semibold text-slate-800";

const BTN_PRIMARY =
  "inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60";

const CONTACT_CARD_CLASS =
  "rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-md";

const CONTACT_ICON_WRAP = "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg";

const CONTACT_ICON_CLASS = "h-4 w-4";

const INITIAL_FORM: InquiryFormState = {
  guardianName: "",
  email: "",
  phone: "",
  helpTopic: "",
  learningNotes: "",
};

export default function ContactAdmissionsPage() {
  const [form, setForm] = useState<InquiryFormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateField = useCallback(
    <K extends keyof InquiryFormState>(key: K, value: InquiryFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setSubmitError(null);
    },
    [],
  );

  const canSubmit = useMemo(() => {
    if (isSubmitting) return false;
    if (!form.guardianName.trim()) return false;
    if (!form.email.trim()) return false;
    if (!form.phone.trim()) return false;
    if (!form.helpTopic) return false;
    return true;
  }, [form, isSubmitting]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canSubmit) return;

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const response = await fetch("/api/contact-inquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            guardianName: form.guardianName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            helpTopic: form.helpTopic,
            learningNotes: form.learningNotes.trim(),
          }),
        });

        const result = (await response.json()) as { success?: boolean; error?: string };

        if (!response.ok || !result.success) {
          throw new Error(result.error ?? "Failed to send inquiry.");
        }

        setSubmitted(true);
        setForm(INITIAL_FORM);
      } catch {
        setSubmitError(
          `We could not send your inquiry. Please try again or email us at ${SALES_EMAIL ?? ""}.`,
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [canSubmit, form],
  );

  const resetInquiry = useCallback(() => {
    setSubmitted(false);
    setSubmitError(null);
    setForm(INITIAL_FORM);
  }, []);

  return (
    <>
      <MarketingNav />
      <main className="flex-1 bg-slate-50">
        {/* Hero */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8">
            <Link
              href="/"
              className="inline-flex text-sm font-medium text-indigo-600 transition-colors duration-200 hover:text-violet-600"
            >
              ← Back to home
            </Link>
            <div className="mx-auto mt-4 max-w-4xl text-center sm:mt-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
                Admissions &amp; Academic Consultation
              </p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:mt-4 sm:text-4xl lg:text-5xl">
                Let&apos;s Design Your Child&apos;s Academic Blueprint
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-600 sm:mt-5">
                Connect with our elite global admissions concierge team to map out customized
                pacing, international curriculum compliance, and personal milestone pathways.
              </p>
            </div>
          </div>
        </section>

        {/* Dual-column grid */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Column A — Inquiry form */}
            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
                <div className="px-4 py-5 sm:px-5">
                  {submitted ? (
                    <div
                      className="rounded-lg border border-emerald-200 bg-emerald-50/80 px-4 py-6 text-center"
                      role="status"
                    >
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg text-emerald-700">
                        ✓
                      </div>
                      <h3 className="mt-3 text-base font-bold text-slate-900">
                        Inquiry Submitted Successfully
                      </h3>
                      <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-slate-600">
                        A concierge advisor will reach out shortly.
                      </p>
                      <button
                        type="button"
                        onClick={resetInquiry}
                        className="mt-5 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition-all duration-300 hover:border-indigo-300 hover:bg-slate-50 active:scale-[0.98]"
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block sm:col-span-2">
                          <span className={LABEL_CLASS}>Full Name</span>
                          <input
                            type="text"
                            name="guardianName"
                            autoComplete="name"
                            value={form.guardianName}
                            onChange={(e) => updateField("guardianName", e.target.value)}
                            className={INPUT_CLASS}
                            placeholder="Full legal name"
                            required
                          />
                        </label>

                        <label className="block">
                          <span className={LABEL_CLASS}>Contact Email</span>
                          <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={form.email}
                            onChange={(e) => updateField("email", e.target.value)}
                            className={INPUT_CLASS}
                            placeholder="Your email address"
                            required
                          />
                        </label>

                        <label className="block">
                          <span className={LABEL_CLASS}>Phone / WhatsApp</span>
                          <input
                            type="tel"
                            name="phone"
                            autoComplete="tel"
                            value={form.phone}
                            onChange={(e) => updateField("phone", e.target.value)}
                            className={INPUT_CLASS}
                            placeholder="+91 9876543210"
                            required
                          />
                        </label>
                      </div>

                      <label className="block">
                        <span className={LABEL_CLASS}>How can we help you?</span>
                        <select
                          name="helpTopic"
                          value={form.helpTopic}
                          onChange={(e) =>
                            updateField("helpTopic", e.target.value as HelpTopicId)
                          }
                          className={`${INPUT_CLASS} cursor-pointer`}
                          required
                        >
                          <option value="" disabled>
                            Select a topic
                          </option>
                          {HELP_TOPICS.map((option) => (
                            <option key={option.value ?? ""} value={option.value ?? ""}>
                              {option.label ?? ""}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className={LABEL_CLASS}>
                          Message
                        </span>
                        <textarea
                          name="learningNotes"
                          rows={4}
                          value={form.learningNotes}
                          onChange={(e) => updateField("learningNotes", e.target.value)}
                          className={`${INPUT_CLASS} resize-y min-h-[96px]`}
                          placeholder="Share learning preferences, sport schedules, travel plans, or university targets…"
                        />
                      </label>

                      {submitError ? (
                        <p
                          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                          role="alert"
                        >
                          {submitError ?? ""}
                        </p>
                      ) : null}

                      <button type="submit" className={BTN_PRIMARY} disabled={!canSubmit}>
                        {isSubmitting ? "Sending…" : "Submit Inquiry"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Column B — Contact hub */}
            <aside className="flex flex-col gap-3 lg:col-span-5">
              <div className={CONTACT_CARD_CLASS}>
                <div className="flex gap-3">
                  <div className={`${CONTACT_ICON_WRAP} bg-violet-100 text-violet-700`}>
                    <svg
                      className={CONTACT_ICON_CLASS}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900">Email us</h3>
                    <a
                      href={`mailto:${SALES_EMAIL}`}
                      className="mt-0.5 inline-block text-sm font-semibold text-indigo-700 underline decoration-indigo-200 underline-offset-2 transition-colors duration-200 hover:text-violet-700"
                    >
                      {SALES_EMAIL ?? ""}
                    </a>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      We reply within one business day.
                    </p>
                  </div>
                </div>
              </div>

              <div className={CONTACT_CARD_CLASS}>
                <div className="flex gap-3">
                  <div className={`${CONTACT_ICON_WRAP} bg-indigo-100 text-indigo-700`}>
                    <svg
                      className={CONTACT_ICON_CLASS}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900">Call us</h3>
                    <a
                      href={`tel:${CONTACT_PHONE_HREF}`}
                      className="mt-0.5 inline-flex text-sm font-semibold text-indigo-700 transition-colors duration-200 hover:text-violet-700"
                    >
                      {CONTACT_PHONE_DISPLAY ?? ""}
                    </a>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      Mon – Fri, 9 AM – 6 PM IST
                    </p>
                  </div>
                </div>
              </div>

              <div className={CONTACT_CARD_CLASS}>
                <div className="flex gap-3">
                  <div className={`${CONTACT_ICON_WRAP} bg-slate-100 text-slate-700`}>
                    <svg
                      className={CONTACT_ICON_CLASS}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900">Visit us</h3>
                    <p className="mt-1 text-xs font-semibold text-slate-900">
                      {VISIT_CITY_LINE ?? ""}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                      {VISIT_ADDRESS_LINE ?? ""}
                    </p>
                  </div>
                </div>
              </div>

              <div className={CONTACT_CARD_CLASS}>
                <div className="flex gap-3">
                  <div className={`${CONTACT_ICON_WRAP} bg-indigo-100 text-indigo-700`}>
                    <svg
                      className={CONTACT_ICON_CLASS}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900">Business hours</h3>
                    <p className="mt-1 text-xs font-medium text-slate-800">
                      Mon – Fri, 9 AM – 6 PM IST
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                      We&apos;re also available on weekends for enterprise inquiries.
                    </p>
                  </div>
                </div>
              </div>

              <p className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-3 text-center text-xs leading-relaxed text-slate-600">
                Prefer a quick call?{" "}
                <a
                  href={`tel:${CONTACT_PHONE_HREF}`}
                  className="font-semibold text-indigo-700 underline decoration-indigo-200 underline-offset-2 transition-colors duration-200 hover:text-violet-700"
                >
                  Dial us directly
                </a>{" "}
                and we&apos;ll connect you to the right team.
              </p>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}
