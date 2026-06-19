"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

const ADMIN_COURSES_PATH = "/admin/courses";

const REVALIDATE_PATHS = [ADMIN_COURSES_PATH, "/courses", "/"] as const;

export type CatalogActionState = {
  ok: boolean;
  error?: string;
  message?: string;
};

type AdminContext =
  | { supabase: Awaited<ReturnType<typeof createClient>>; userId: string }
  | { error: string };

async function requireAdmin(): Promise<AdminContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Only administrators can manage the curriculum catalog." };
  }

  return { supabase, userId: user.id };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readString(formData: FormData, key: string): string {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

function readBoolean(formData: FormData, key: string): boolean {
  const raw = formData.get(key);
  return raw === "on" || raw === "true" || raw === "1";
}

function readOptionalInt(formData: FormData, key: string): number | null {
  const raw = readString(formData, key);
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function readResourcePaths(formData: FormData): string[] {
  const raw = readString(formData, "resource_paths");
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is string => typeof entry === "string" && entry.length > 0);
  } catch {
    return [];
  }
}

const UNLOCK_STRATEGIES = [
  "all_at_once",
  "sequential",
  "drip",
  "manual",
] as const;

type UnlockStrategy = (typeof UNLOCK_STRATEGIES)[number];

function isUnlockStrategy(value: string): value is UnlockStrategy {
  return (UNLOCK_STRATEGIES as readonly string[]).includes(value);
}

async function nextCourseSortOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<number> {
  const { data } = await supabase
    .from("courses")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.sort_order ?? -1) + 1;
}

async function nextModuleSortOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  courseId: string,
): Promise<number> {
  const { data } = await supabase
    .from("course_modules")
    .select("sort_order")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.sort_order ?? -1) + 1;
}

async function nextLessonSortOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  moduleId: string,
): Promise<number> {
  const { data } = await supabase
    .from("lessons")
    .select("sort_order")
    .eq("module_id", moduleId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.sort_order ?? -1) + 1;
}

async function resolveUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  baseSlug: string,
): Promise<string> {
  let candidate = baseSlug || "course";
  let suffix = 0;

  while (true) {
    const { data } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (!data) return candidate;
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
}

function revalidateCatalog() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
}

export async function createCourse(
  _prev: CatalogActionState | null,
  formData: FormData,
): Promise<CatalogActionState> {
  const ctx = await requireAdmin();
  if ("error" in ctx) {
    return { ok: false, error: ctx.error };
  }

  const title = readString(formData, "title");
  if (!title) {
    return { ok: false, error: "Course title is required." };
  }

  const slugInput = readString(formData, "slug");
  const baseSlug = slugify(slugInput || title);
  const slug = await resolveUniqueSlug(ctx.supabase, baseSlug);

  const unlockStrategyRaw = readString(formData, "unlock_strategy") || "sequential";
  const unlockStrategy = isUnlockStrategy(unlockStrategyRaw)
    ? unlockStrategyRaw
    : "sequential";

  const dripIntervalDays =
    unlockStrategy === "drip" ? readOptionalInt(formData, "drip_interval_days") : null;

  const sortOrder = await nextCourseSortOrder(ctx.supabase);

  const { error } = await ctx.supabase.from("courses").insert({
    slug,
    title,
    description: readString(formData, "description") || null,
    grade_level: readString(formData, "grade_level") || null,
    curriculum_tag: readString(formData, "curriculum_tag") || null,
    thumbnail_url: readString(formData, "thumbnail_url") || null,
    is_published: readBoolean(formData, "is_published"),
    unlock_strategy: unlockStrategy,
    drip_interval_days: dripIntervalDays,
    sort_order: sortOrder,
    created_by: ctx.userId,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateCatalog();
  return { ok: true, message: `Course “${title}” created.` };
}

export async function createModule(
  _prev: CatalogActionState | null,
  formData: FormData,
): Promise<CatalogActionState> {
  const ctx = await requireAdmin();
  if ("error" in ctx) {
    return { ok: false, error: ctx.error };
  }

  const courseId = readString(formData, "course_id");
  const title = readString(formData, "title");
  if (!courseId) {
    return { ok: false, error: "Course is required." };
  }
  if (!title) {
    return { ok: false, error: "Module title is required." };
  }

  const sortOrder = await nextModuleSortOrder(ctx.supabase, courseId);

  const { error } = await ctx.supabase.from("course_modules").insert({
    course_id: courseId,
    title,
    description: readString(formData, "description") || null,
    sort_order: sortOrder,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateCatalog();
  return { ok: true, message: `Module “${title}” added.` };
}

export async function createLesson(
  _prev: CatalogActionState | null,
  formData: FormData,
): Promise<CatalogActionState> {
  const ctx = await requireAdmin();
  if ("error" in ctx) {
    return { ok: false, error: ctx.error };
  }

  const moduleId = readString(formData, "module_id");
  const title = readString(formData, "title");
  if (!moduleId) {
    return { ok: false, error: "Module is required." };
  }
  if (!title) {
    return { ok: false, error: "Lesson title is required." };
  }

  const sortOrder = await nextLessonSortOrder(ctx.supabase, moduleId);
  const videoPath = readString(formData, "video_storage_path");

  const { error } = await ctx.supabase.from("lessons").insert({
    module_id: moduleId,
    title,
    description: readString(formData, "description") || null,
    sort_order: sortOrder,
    video_storage_path: videoPath || null,
    video_duration_seconds: readOptionalInt(formData, "video_duration_seconds"),
    resource_paths: readResourcePaths(formData),
    is_preview: readBoolean(formData, "is_preview"),
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateCatalog();
  return { ok: true, message: `Lesson “${title}” attached.` };
}

export async function toggleCoursePublished(
  courseId: string,
  publish: boolean,
): Promise<CatalogActionState> {
  const ctx = await requireAdmin();
  if ("error" in ctx) {
    return { ok: false, error: ctx.error };
  }

  const { error } = await ctx.supabase
    .from("courses")
    .update({ is_published: publish })
    .eq("id", courseId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateCatalog();
  return {
    ok: true,
    message: publish ? "Course published." : "Course moved to draft.",
  };
}

export async function updateCourse(
  _prev: CatalogActionState | null,
  formData: FormData,
): Promise<CatalogActionState> {
  const ctx = await requireAdmin();
  if ("error" in ctx) {
    return { ok: false, error: ctx.error };
  }

  const courseId = readString(formData, "course_id");
  const title = readString(formData, "title");
  if (!courseId) {
    return { ok: false, error: "Course is required." };
  }
  if (!title) {
    return { ok: false, error: "Course title is required." };
  }

  const unlockStrategyRaw = readString(formData, "unlock_strategy") || "sequential";
  const unlockStrategy = isUnlockStrategy(unlockStrategyRaw)
    ? unlockStrategyRaw
    : "sequential";

  const dripIntervalDays =
    unlockStrategy === "drip" ? readOptionalInt(formData, "drip_interval_days") : null;

  const { error } = await ctx.supabase
    .from("courses")
    .update({
      title,
      description: readString(formData, "description") || null,
      grade_level: readString(formData, "grade_level") || null,
      curriculum_tag: readString(formData, "curriculum_tag") || null,
      thumbnail_url: readString(formData, "thumbnail_url") || null,
      unlock_strategy: unlockStrategy,
      drip_interval_days: dripIntervalDays,
    })
    .eq("id", courseId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateCatalog();
  return { ok: true, message: `Course “${title}” updated.` };
}

export async function updateModule(
  _prev: CatalogActionState | null,
  formData: FormData,
): Promise<CatalogActionState> {
  const ctx = await requireAdmin();
  if ("error" in ctx) {
    return { ok: false, error: ctx.error };
  }

  const moduleId = readString(formData, "module_id");
  const title = readString(formData, "title");
  if (!moduleId || !title) {
    return { ok: false, error: "Module and title are required." };
  }

  const { error } = await ctx.supabase
    .from("course_modules")
    .update({
      title,
      description: readString(formData, "description") || null,
    })
    .eq("id", moduleId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateCatalog();
  return { ok: true, message: `Module “${title}” updated.` };
}

export async function updateLesson(
  _prev: CatalogActionState | null,
  formData: FormData,
): Promise<CatalogActionState> {
  const ctx = await requireAdmin();
  if ("error" in ctx) {
    return { ok: false, error: ctx.error };
  }

  const lessonId = readString(formData, "lesson_id");
  const title = readString(formData, "title");
  if (!lessonId || !title) {
    return { ok: false, error: "Lesson and title are required." };
  }

  const { error } = await ctx.supabase
    .from("lessons")
    .update({
      title,
      description: readString(formData, "description") || null,
      video_duration_seconds: readOptionalInt(formData, "video_duration_seconds"),
      is_preview: readBoolean(formData, "is_preview"),
    })
    .eq("id", lessonId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateCatalog();
  return { ok: true, message: `Lesson “${title}” updated.` };
}

export async function deleteCourse(courseId: string): Promise<CatalogActionState> {
  const ctx = await requireAdmin();
  if ("error" in ctx) {
    return { ok: false, error: ctx.error };
  }

  const { error } = await ctx.supabase.from("courses").delete().eq("id", courseId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateCatalog();
  return { ok: true, message: "Course removed." };
}

export async function deleteModule(moduleId: string): Promise<CatalogActionState> {
  const ctx = await requireAdmin();
  if ("error" in ctx) {
    return { ok: false, error: ctx.error };
  }

  const { error } = await ctx.supabase
    .from("course_modules")
    .delete()
    .eq("id", moduleId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateCatalog();
  return { ok: true, message: "Module removed." };
}

export async function deleteLesson(lessonId: string): Promise<CatalogActionState> {
  const ctx = await requireAdmin();
  if ("error" in ctx) {
    return { ok: false, error: ctx.error };
  }

  const { error } = await ctx.supabase.from("lessons").delete().eq("id", lessonId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateCatalog();
  return { ok: true, message: "Lesson removed." };
}

export async function uploadLessonVideo(
  _prev: CatalogActionState | null,
  formData: FormData,
): Promise<CatalogActionState> {
  const ctx = await requireAdmin();
  if ("error" in ctx) {
    return { ok: false, error: ctx.error };
  }

  const lessonId = readString(formData, "lesson_id");
  const courseId = readString(formData, "course_id");
  const storagePath = readString(formData, "video_storage_path");

  if (!lessonId || !courseId) {
    return { ok: false, error: "Lesson and course are required." };
  }

  if (!storagePath) {
    return { ok: false, error: "Video storage path is required." };
  }

  if (!storagePath.startsWith(`courses/${courseId}/`)) {
    return {
      ok: false,
      error: "Video path must use courses/{courseId}/{filename} inside lesson-videos.",
    };
  }

  const { error: updateError } = await ctx.supabase
    .from("lessons")
    .update({ video_storage_path: storagePath })
    .eq("id", lessonId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  revalidateCatalog();
  return { ok: true, message: "Lesson video uploaded." };
}
