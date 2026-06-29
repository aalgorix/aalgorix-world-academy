"use client";

import {
  Bell,
  Globe,
  Lock,
  Moon,
  Palette,
  Save,
  Sun,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { saveStudentSettings } from "@/app/(dashboard)/student/settings/actions";
import type {
  StudentLanguage,
  StudentSettingsPrefs,
  StudentTheme,
} from "@/lib/student/settings";

const LANGUAGES: { value: StudentLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
  { value: "fr", label: "French" },
  { value: "hi", label: "Hindi" },
];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative w-[44px] h-[24px] rounded-full shrink-0 mt-0.5 transition-colors"
      style={{ background: checked ? "#6366F1" : "#D1D5DB" }}
      aria-pressed={checked}
    >
      <span
        className="absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-all"
        style={{ left: checked ? "calc(100% - 21px)" : 3 }}
      />
    </button>
  );
}

export function SettingsForm({ initialSettings }: { initialSettings: StudentSettingsPrefs }) {
  const [settings, setSettings] = useState(initialSettings);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const themeOptions: { value: StudentTheme; icon: React.ReactNode; label: string }[] = [
    { value: "light", icon: <Sun className="w-4 h-4" />, label: "Light" },
    { value: "dark", icon: <Moon className="w-4 h-4" />, label: "Dark" },
    { value: "system", icon: <Palette className="w-4 h-4" />, label: "System" },
  ];

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveStudentSettings(settings);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 860, padding: "28px 32px 60px" }}>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#1A1B2E]">Settings</h1>
          <p className="mt-1 text-[14px] font-medium text-[#9AA0B8]">
            Manage your preferences and account settings.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[14px] font-bold text-white transition-all disabled:opacity-60"
          style={{ background: saved ? "#10B981" : "linear-gradient(135deg,#6366F1,#8B5CF6)" }}
        >
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : isPending ? "Saving…" : "Save changes"}
        </button>
      </div>

      {error ? (
        <div
          role="alert"
          className="mb-5 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-5">
        <section
          className="bg-white border border-[#ECEDF3] rounded-[22px] p-6"
          style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <User className="w-5 h-5 text-[#5B5BF0]" />
            <h2 className="text-[16px] font-extrabold text-[#1A1B2E]">Account</h2>
          </div>
          <p className="text-[13.5px] text-[#6B6F8A] mb-4">
            Manage your profile information, password, and linked accounts.
          </p>
          <Link
            href="/student/profile"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[11px] text-[13.5px] font-bold bg-[#EEF0FF] text-[#5B5BF0] transition-colors hover:bg-[#DDE0FF]"
          >
            <User className="w-4 h-4" /> Go to Profile
          </Link>
        </section>

        <section
          className="bg-white border border-[#ECEDF3] rounded-[22px] p-6"
          style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Palette className="w-5 h-5 text-[#F59E0B]" />
            <h2 className="text-[16px] font-extrabold text-[#1A1B2E]">Appearance</h2>
          </div>

          <div className="mb-5">
            <label className="block text-[13px] font-bold text-[#41435F] mb-2">Theme</label>
            <div className="flex gap-2 flex-wrap">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSettings((prev) => ({ ...prev, theme: opt.value }))}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-[13px] font-bold border transition-all"
                  style={
                    settings.theme === opt.value
                      ? { background: "#1A1B2E", color: "#fff", border: "1px solid #1A1B2E" }
                      : { background: "#fff", color: "#6B6F8A", border: "1px solid #ECEDF3" }
                  }
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="language" className="block text-[13px] font-bold text-[#41435F] mb-2">
              Language
            </label>
            <select
              id="language"
              value={settings.language}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  language: event.target.value as StudentLanguage,
                }))
              }
              className="px-4 py-2.5 rounded-[12px] border border-[#ECEDF3] bg-white text-[13px] font-semibold text-[#1A1B2E] outline-none focus:border-[#6366F1] transition-colors"
            >
              {LANGUAGES.map((language) => (
                <option key={language.value} value={language.value}>
                  {language.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section
          className="bg-white border border-[#ECEDF3] rounded-[22px] p-6"
          style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Bell className="w-5 h-5 text-[#E11D48]" />
            <h2 className="text-[16px] font-extrabold text-[#1A1B2E]">Notifications</h2>
          </div>

          <div className="flex flex-col gap-4">
            {(
              [
                { key: "liveReminder", label: "Live class reminders", desc: "Get notified 10 minutes before a class starts" },
                { key: "assignmentDue", label: "Assignment deadlines", desc: "Alert when an assignment is due within 24 hours" },
                { key: "gradeReceived", label: "Grade received", desc: "Notify when your submission is graded" },
                { key: "messages", label: "New messages", desc: "Notify when a teacher sends you a message" },
                { key: "announcements", label: "Announcements", desc: "School-wide notices and updates" },
              ] as const
            ).map(({ key, label, desc }) => (
              <div
                key={key}
                className="flex items-start justify-between gap-4 py-3 border-b border-[#F8F8FC] last:border-0"
              >
                <div>
                  <div className="text-[14px] font-bold text-[#1A1B2E]">{label}</div>
                  <div className="text-[12px] font-medium text-[#9AA0B8] mt-0.5">{desc}</div>
                </div>
                <Toggle
                  checked={settings.notifications[key]}
                  onChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, [key]: value },
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </section>

        <section
          className="bg-white border border-[#ECEDF3] rounded-[22px] p-6"
          style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-5 h-5 text-[#10B981]" />
            <h2 className="text-[16px] font-extrabold text-[#1A1B2E]">Security</h2>
          </div>
          <p className="text-[13.5px] text-[#6B6F8A] mb-4">
            Update your password through the secure account recovery flow.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex px-4 py-2.5 rounded-[11px] text-[13.5px] font-bold border border-[#ECEDF3] text-[#41435F] bg-white transition-colors hover:border-[#6366F1] hover:text-[#5B5BF0]"
          >
            Change password
          </Link>
        </section>

        <section
          className="bg-white border border-[#ECEDF3] rounded-[22px] p-6"
          style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-5 h-5 text-[#6366F1]" />
            <h2 className="text-[16px] font-extrabold text-[#1A1B2E]">Privacy</h2>
          </div>
          <p className="text-[13.5px] text-[#6B6F8A] mb-4">
            Control what information is visible to other students and teachers.
          </p>
          <div className="flex flex-col gap-3">
            {(
              [
                { key: "classmates", label: "Show my profile to classmates" },
                { key: "teachers", label: "Show my progress to teachers" },
                { key: "leaderboard", label: "Appear in leaderboards" },
              ] as const
            ).map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between py-2">
                <span className="text-[14px] font-semibold text-[#1A1B2E]">{label}</span>
                <Toggle
                  checked={settings.privacy[key]}
                  onChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, [key]: value },
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
