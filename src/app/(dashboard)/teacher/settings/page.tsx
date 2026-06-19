"use client";

import { Bell, Lock, Moon, Shield, Sun, User } from "lucide-react";
import { useState } from "react";

type Toggle = { id: string; label: string; desc: string; value: boolean };

export default function TeacherSettingsPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState("English");

  const [notifications, setNotifications] = useState<Toggle[]>([
    { id: "n1", label: "New submission",    desc: "When a student submits an assignment", value: true },
    { id: "n2", label: "New message",       desc: "When you receive a new message",       value: true },
    { id: "n3", label: "Class reminder",    desc: "30 minutes before a scheduled class",  value: true },
    { id: "n4", label: "Grade due",         desc: "When grading deadline is approaching", value: false },
    { id: "n5", label: "Digest summary",    desc: "Weekly summary of your activity",      value: true },
  ]);

  const [privacy, setPrivacy] = useState<Toggle[]>([
    { id: "p1", label: "Profile visible to students", desc: "Students can see your name and subjects", value: true },
    { id: "p2", label: "Show online status",           desc: "Others can see when you are active",       value: false },
  ]);

  function toggleNotif(id: string) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, value: !n.value } : n));
  }
  function togglePrivacy(id: string) {
    setPrivacy((prev) => prev.map((p) => p.id === id ? { ...p, value: !p.value } : p));
  }

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 780, padding: "28px 32px 80px" }}>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-[14px] font-medium text-slate-500">Manage your account preferences and notifications.</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Account */}
        <Section title="Account" icon={<User className="w-4 h-4" />}>
          <Row label="Edit profile" desc="Update your name and bio" link="/teacher/profile" />
          <Row label="Email address" desc="Change your login email" />
          <Row label="Sign out" desc="End your current session" danger />
        </Section>

        {/* Appearance */}
        <Section title="Appearance" icon={<Sun className="w-4 h-4" />}>
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[14px] font-bold text-slate-900">Theme</div>
                <div className="text-[12.5px] text-slate-500">Choose your preferred UI theme</div>
              </div>
              <div className="flex gap-2">
                {(["light", "dark"] as const).map((t) => (
                  <button key={t} onClick={() => setTheme(t)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[12.5px] font-bold border transition-all"
                    style={theme === t
                      ? { background: "#0D9488", color: "#fff", borderColor: "#0D9488" }
                      : { background: "#fff", color: "#64748B", borderColor: "#E2E8F0" }}>
                    {t === "light" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-bold text-slate-900">Language</div>
                <div className="text-[12.5px] text-slate-500">Interface language</div>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border border-slate-200 rounded-[10px] px-3 py-1.5 text-[13px] font-semibold text-slate-700 bg-white outline-none focus:border-teal-400 transition-colors"
              >
                {["English", "Hindi", "Marathi", "Gujarati"].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" icon={<Bell className="w-4 h-4" />}>
          {notifications.map((n) => (
            <ToggleRow key={n.id} item={n} onToggle={() => toggleNotif(n.id)} />
          ))}
        </Section>

        {/* Security */}
        <Section title="Security" icon={<Lock className="w-4 h-4" />}>
          <Row label="Change password"       desc="Update your login password" />
          <Row label="Two-factor authentication" desc="Add an extra layer of security" />
        </Section>

        {/* Privacy */}
        <Section title="Privacy" icon={<Shield className="w-4 h-4" />}>
          {privacy.map((p) => (
            <ToggleRow key={p.id} item={p} onToggle={() => togglePrivacy(p.id)} />
          ))}
        </Section>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-[22px] overflow-hidden"
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 4px 12px rgba(0,0,0,.03)" }}>
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
        <span className="text-teal-600">{icon}</span>
        <span className="text-[15px] font-extrabold text-slate-900">{title}</span>
      </div>
      <div className="divide-y divide-slate-50">{children}</div>
    </div>
  );
}

function Row({ label, desc, link, danger }: { label: string; desc: string; link?: string; danger?: boolean }) {
  const Tag = link ? "a" : "button";
  return (
    <Tag href={link} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors">
      <div>
        <div className="text-[14px] font-bold" style={{ color: danger ? "#EF4444" : "#0F172A" }}>{label}</div>
        <div className="text-[12.5px] text-slate-500">{desc}</div>
      </div>
      <span className="text-slate-400 text-[18px]">›</span>
    </Tag>
  );
}

function ToggleRow({ item, onToggle }: { item: Toggle; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div>
        <div className="text-[14px] font-bold text-slate-900">{item.label}</div>
        <div className="text-[12.5px] text-slate-500">{item.desc}</div>
      </div>
      <button onClick={onToggle} className="relative w-10 h-5.5 rounded-full transition-colors shrink-0"
        style={{ background: item.value ? "#0D9488" : "#CBD5E1", width: 40, height: 22 }}>
        <span className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow transition-all"
          style={{ left: item.value ? 20 : 3 }} />
      </button>
    </div>
  );
}
