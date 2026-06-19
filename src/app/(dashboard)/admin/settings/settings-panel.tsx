"use client";

import { Bell, Globe, Loader2, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  updateAdminThemeAction,
  updatePlatformSettingsAction,
  type PlatformSettings,
} from "./actions";

type Toggle = { id: keyof PlatformSettings["admin_notification_prefs"]; label: string; desc: string };

const NOTIFICATION_TOGGLES: Toggle[] = [
  { id: "new_user_registration", label: "New user registration", desc: "When a new account is created on the platform" },
  { id: "enrollment_created", label: "Enrollment created", desc: "When a student is enrolled in a course" },
  { id: "pending_submissions", label: "Pending submissions", desc: "Daily digest of ungraded submissions" },
  { id: "system_alerts", label: "System alerts", desc: "Critical platform health notifications" },
];

export function SettingsPanel({
  platform,
  theme,
}: {
  platform: PlatformSettings;
  theme: "light" | "dark";
}) {
  const router = useRouter();
  const [settings, setSettings] = useState(platform);
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function savePlatform() {
    setSaving(true);
    setError(null);
    setMessage(null);
    const result = await updatePlatformSettingsAction(settings);
    setSaving(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setMessage("Platform settings saved.");
    router.refresh();
  }

  async function saveTheme(next: "light" | "dark") {
    setCurrentTheme(next);
    const result = await updateAdminThemeAction(next);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setMessage("Theme preference saved.");
  }

  function toggleNotification(id: Toggle["id"]) {
    setSettings((prev) => ({
      ...prev,
      admin_notification_prefs: {
        ...prev.admin_notification_prefs,
        [id]: !prev.admin_notification_prefs[id],
      },
    }));
  }

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 800, padding: "28px 32px 80px" }}>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Admin Settings</h1>
        <p className="mt-1 text-[14px] font-medium text-slate-500">
          Platform configuration and administrator preferences.
        </p>
      </div>

      {(message || error) && (
        <div
          className={`mb-5 rounded-[14px] px-4 py-3 text-[13px] font-semibold ${
            error
              ? "border border-red-200 bg-red-50 text-red-700"
              : "border border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <div className="flex flex-col gap-5">
        <Section title="Account" icon={<Globe className="w-4 h-4" />}>
          <Link
            href="/admin/users"
            className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
          >
            <div>
              <div className="text-[14px] font-bold text-slate-900">Manage users</div>
              <div className="text-[12.5px] text-slate-500">Create and edit platform accounts</div>
            </div>
            <span className="text-slate-400">›</span>
          </Link>
        </Section>

        <Section title="Appearance" icon={<Sun className="w-4 h-4" />}>
          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-bold text-slate-900">Theme</div>
                <div className="text-[12.5px] text-slate-500">Saved to your admin profile</div>
              </div>
              <div className="flex gap-2">
                {(["light", "dark"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => saveTheme(t)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[12.5px] font-bold border transition-all"
                    style={
                      currentTheme === t
                        ? { background: "#7C3AED", color: "#fff", borderColor: "#7C3AED" }
                        : { background: "#fff", color: "#64748B", borderColor: "#E2E8F0" }
                    }
                  >
                    {t === "light" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Notifications" icon={<Bell className="w-4 h-4" />}>
          {NOTIFICATION_TOGGLES.map((item) => (
            <ToggleRow
              key={item.id}
              label={item.label}
              desc={item.desc}
              value={settings.admin_notification_prefs[item.id]}
              onToggle={() => toggleNotification(item.id)}
            />
          ))}
        </Section>

        <Section title="Platform controls" icon={<Globe className="w-4 h-4" />}>
          <ToggleRow
            label="Allow new registrations"
            desc="New users can sign up from the marketing page"
            value={settings.allow_registration}
            onToggle={() =>
              setSettings((prev) => ({ ...prev, allow_registration: !prev.allow_registration }))
            }
          />
          <ToggleRow
            label="Maintenance mode"
            desc="Display maintenance banner to all users"
            value={settings.maintenance_mode}
            onToggle={() =>
              setSettings((prev) => ({ ...prev, maintenance_mode: !prev.maintenance_mode }))
            }
          />
          <ToggleRow
            label="Public course catalog"
            desc="Published courses visible without login"
            value={settings.public_course_catalog}
            onToggle={() =>
              setSettings((prev) => ({
                ...prev,
                public_course_catalog: !prev.public_course_catalog,
              }))
            }
          />
          <div className="px-5 py-4 border-t border-slate-50">
            <button
              type="button"
              onClick={savePlatform}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[13.5px] font-bold text-white disabled:opacity-60"
              style={{ background: "#7C3AED" }}
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {saving ? "Saving…" : "Save platform settings"}
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-white border border-slate-200 rounded-[22px] overflow-hidden"
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 4px 12px rgba(0,0,0,.03)" }}
    >
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
        <span className="text-violet-600">{icon}</span>
        <span className="text-[15px] font-extrabold text-slate-900">{title}</span>
      </div>
      <div className="divide-y divide-slate-50">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  value,
  onToggle,
}: {
  label: string;
  desc: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div>
        <div className="text-[14px] font-bold text-slate-900">{label}</div>
        <div className="text-[12.5px] text-slate-500">{desc}</div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="relative shrink-0 rounded-full transition-colors"
        style={{ background: value ? "#7C3AED" : "#CBD5E1", width: 40, height: 22 }}
      >
        <span
          className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow transition-all"
          style={{ left: value ? 20 : 3 }}
        />
      </button>
    </div>
  );
}
