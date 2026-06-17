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
import { useState } from "react";

type Theme = "light" | "dark" | "system";
type Language = "en" | "ar" | "fr" | "hi";

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
  { value: "fr", label: "French" },
  { value: "hi", label: "Hindi" },
];

export default function SettingsPage() {
  const [theme,     setTheme]     = useState<Theme>("system");
  const [language,  setLanguage]  = useState<Language>("en");
  const [saved,     setSaved]     = useState(false);

  const [notifs, setNotifs] = useState({
    liveReminder:  true,
    assignmentDue: true,
    gradeReceived: true,
    messages:      true,
    announcements: false,
  });

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const themeOptions: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: "light",  icon: <Sun  className="w-4 h-4" />, label: "Light"  },
    { value: "dark",   icon: <Moon className="w-4 h-4" />, label: "Dark"   },
    { value: "system", icon: <Palette className="w-4 h-4" />, label: "System" },
  ];

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 860, padding: "28px 32px 60px" }}>
      {/* heading */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#1A1B2E]">Settings</h1>
          <p className="mt-1 text-[14px] font-medium text-[#9AA0B8]">Manage your preferences and account settings.</p>
        </div>
        <button
          onClick={save}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[14px] font-bold text-white transition-all"
          style={{ background: saved ? "#10B981" : "linear-gradient(135deg,#6366F1,#8B5CF6)" }}
        >
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : "Save changes"}
        </button>
      </div>

      <div className="flex flex-col gap-5">
        {/* ── Account ─────────────────────────── */}
        <section className="bg-white border border-[#ECEDF3] rounded-[22px] p-6"
          style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}>
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

        {/* ── Appearance ──────────────────────── */}
        <section className="bg-white border border-[#ECEDF3] rounded-[22px] p-6"
          style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}>
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
                  onClick={() => setTheme(opt.value)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-[13px] font-bold border transition-all"
                  style={
                    theme === opt.value
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
            <label className="block text-[13px] font-bold text-[#41435F] mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="px-4 py-2.5 rounded-[12px] border border-[#ECEDF3] bg-white text-[13px] font-semibold text-[#1A1B2E] outline-none focus:border-[#6366F1] transition-colors"
            >
              {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
        </section>

        {/* ── Notifications ───────────────────── */}
        <section className="bg-white border border-[#ECEDF3] rounded-[22px] p-6"
          style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}>
          <div className="flex items-center gap-2 mb-5">
            <Bell className="w-5 h-5 text-[#E11D48]" />
            <h2 className="text-[16px] font-extrabold text-[#1A1B2E]">Notifications</h2>
          </div>

          <div className="flex flex-col gap-4">
            {(
              [
                { key:"liveReminder",  label:"Live class reminders",      desc:"Get notified 10 minutes before a class starts" },
                { key:"assignmentDue", label:"Assignment deadlines",       desc:"Alert when an assignment is due within 24 hours" },
                { key:"gradeReceived", label:"Grade received",             desc:"Notify when your submission is graded" },
                { key:"messages",      label:"New messages",               desc:"Notify when a teacher sends you a message" },
                { key:"announcements", label:"Announcements",              desc:"School-wide notices and updates" },
              ] as { key: keyof typeof notifs; label: string; desc: string }[]
            ).map(({ key, label, desc }) => (
              <div key={key} className="flex items-start justify-between gap-4 py-3 border-b border-[#F8F8FC] last:border-0">
                <div>
                  <div className="text-[14px] font-bold text-[#1A1B2E]">{label}</div>
                  <div className="text-[12px] font-medium text-[#9AA0B8] mt-0.5">{desc}</div>
                </div>
                <button
                  onClick={() => setNotifs((prev) => ({ ...prev, [key]: !prev[key] }))}
                  className="relative w-[44px] h-[24px] rounded-full shrink-0 mt-0.5 transition-colors"
                  style={{ background: notifs[key] ? "#6366F1" : "#D1D5DB" }}
                >
                  <span
                    className="absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-all"
                    style={{ left: notifs[key] ? "calc(100% - 21px)" : 3 }}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Security ────────────────────────── */}
        <section className="bg-white border border-[#ECEDF3] rounded-[22px] p-6"
          style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}>
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-5 h-5 text-[#10B981]" />
            <h2 className="text-[16px] font-extrabold text-[#1A1B2E]">Security</h2>
          </div>
          <p className="text-[13.5px] text-[#6B6F8A] mb-4">
            Update your password and manage two-factor authentication.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2.5 rounded-[11px] text-[13.5px] font-bold border border-[#ECEDF3] text-[#41435F] bg-white transition-colors hover:border-[#6366F1] hover:text-[#5B5BF0]">
              Change password
            </button>
            <button className="px-4 py-2.5 rounded-[11px] text-[13.5px] font-bold border border-[#ECEDF3] text-[#41435F] bg-white transition-colors hover:border-[#6366F1] hover:text-[#5B5BF0]">
              Enable 2FA
            </button>
          </div>
        </section>

        {/* ── Privacy ─────────────────────────── */}
        <section className="bg-white border border-[#ECEDF3] rounded-[22px] p-6"
          style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}>
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-5 h-5 text-[#6366F1]" />
            <h2 className="text-[16px] font-extrabold text-[#1A1B2E]">Privacy</h2>
          </div>
          <p className="text-[13.5px] text-[#6B6F8A] mb-4">
            Control what information is visible to other students and teachers.
          </p>
          <div className="flex flex-col gap-3">
            {[
              { label:"Show my profile to classmates",    key:"classmates" },
              { label:"Show my progress to teachers",     key:"teachers"   },
              { label:"Appear in leaderboards",           key:"leaderboard"},
            ].map(({ label, key }) => {
              const [on, setOn] = useState(true);
              return (
                <div key={key} className="flex items-center justify-between py-2">
                  <span className="text-[14px] font-semibold text-[#1A1B2E]">{label}</span>
                  <button
                    onClick={() => setOn((v) => !v)}
                    className="relative w-[44px] h-[24px] rounded-full transition-colors"
                    style={{ background: on ? "#6366F1" : "#D1D5DB" }}
                  >
                    <span
                      className="absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-all"
                      style={{ left: on ? "calc(100% - 21px)" : 3 }}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
