export type StudentTheme = "light" | "dark" | "system";
export type StudentLanguage = "en" | "ar" | "fr" | "hi";

export type StudentNotificationPrefs = {
  liveReminder: boolean;
  assignmentDue: boolean;
  gradeReceived: boolean;
  messages: boolean;
  announcements: boolean;
};

export type StudentPrivacyPrefs = {
  classmates: boolean;
  teachers: boolean;
  leaderboard: boolean;
};

export type StudentSettingsPrefs = {
  theme: StudentTheme;
  language: StudentLanguage;
  notifications: StudentNotificationPrefs;
  privacy: StudentPrivacyPrefs;
};

export const DEFAULT_STUDENT_SETTINGS: StudentSettingsPrefs = {
  theme: "system",
  language: "en",
  notifications: {
    liveReminder: true,
    assignmentDue: true,
    gradeReceived: true,
    messages: true,
    announcements: false,
  },
  privacy: {
    classmates: true,
    teachers: true,
    leaderboard: true,
  },
};

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function readStringEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

export function parseStudentSettings(raw: unknown): StudentSettingsPrefs {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...DEFAULT_STUDENT_SETTINGS };
  }

  const record = raw as Record<string, unknown>;
  const notifications =
    record.notifications && typeof record.notifications === "object"
      ? (record.notifications as Record<string, unknown>)
      : {};
  const privacy =
    record.privacy && typeof record.privacy === "object"
      ? (record.privacy as Record<string, unknown>)
      : {};

  return {
    theme: readStringEnum(
      record.theme,
      ["light", "dark", "system"] as const,
      DEFAULT_STUDENT_SETTINGS.theme,
    ),
    language: readStringEnum(
      record.language,
      ["en", "ar", "fr", "hi"] as const,
      DEFAULT_STUDENT_SETTINGS.language,
    ),
    notifications: {
      liveReminder: readBoolean(
        notifications.liveReminder,
        DEFAULT_STUDENT_SETTINGS.notifications.liveReminder,
      ),
      assignmentDue: readBoolean(
        notifications.assignmentDue,
        DEFAULT_STUDENT_SETTINGS.notifications.assignmentDue,
      ),
      gradeReceived: readBoolean(
        notifications.gradeReceived,
        DEFAULT_STUDENT_SETTINGS.notifications.gradeReceived,
      ),
      messages: readBoolean(
        notifications.messages,
        DEFAULT_STUDENT_SETTINGS.notifications.messages,
      ),
      announcements: readBoolean(
        notifications.announcements,
        DEFAULT_STUDENT_SETTINGS.notifications.announcements,
      ),
    },
    privacy: {
      classmates: readBoolean(
        privacy.classmates,
        DEFAULT_STUDENT_SETTINGS.privacy.classmates,
      ),
      teachers: readBoolean(
        privacy.teachers,
        DEFAULT_STUDENT_SETTINGS.privacy.teachers,
      ),
      leaderboard: readBoolean(
        privacy.leaderboard,
        DEFAULT_STUDENT_SETTINGS.privacy.leaderboard,
      ),
    },
  };
}

export function extractStudentSettingsFromMetadata(
  metadata: unknown,
): StudentSettingsPrefs {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return { ...DEFAULT_STUDENT_SETTINGS };
  }

  const record = metadata as Record<string, unknown>;
  return parseStudentSettings(record.student_settings);
}

export function mergeStudentSettingsIntoMetadata(
  metadata: unknown,
  settings: StudentSettingsPrefs,
): Record<string, unknown> {
  const base =
    metadata && typeof metadata === "object" && !Array.isArray(metadata)
      ? { ...(metadata as Record<string, unknown>) }
      : {};

  return {
    ...base,
    student_settings: settings,
  };
}
