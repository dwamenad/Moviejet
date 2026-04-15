import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sessionCookieName, verifySessionToken } from "@/lib/auth";
import { saveStory } from "@/lib/content";

const postSchema = z.object({
  postId: z.string().trim().optional(),
  title: z.string().trim().min(6),
  slug: z.string().trim().optional(),
  excerpt: z.string().trim().min(20),
  body: z.string().trim().min(80),
  category: z.string().trim().min(2),
  coverImage: z.url(),
  trailerUrl: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null))
    .refine((value) => !value || z.url().safeParse(value).success, "Invalid trailer URL"),
  redirectTo: z.string().trim().optional(),
});

function buildRedirect(
  path: string,
  request: NextRequest,
  messageKey: "error" | "success",
  message: string,
) {
  const url = new URL(path, request.url);
  url.searchParams.set(messageKey, message);
  return NextResponse.redirect(url);
}

export async function POST(request: NextRequest) {
  const session = await verifySessionToken(request.cookies.get(sessionCookieName)?.value);

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const formData = await request.formData();
  const rawRedirectTo = String(formData.get("redirectTo") ?? "/admin");
  const parsed = postSchema.safeParse({
    postId: String(formData.get("postId") ?? ""),
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    body: String(formData.get("body") ?? ""),
    category: String(formData.get("category") ?? ""),
    coverImage: String(formData.get("coverImage") ?? ""),
    trailerUrl: String(formData.get("trailerUrl") ?? ""),
    redirectTo: rawRedirectTo,
  });

  if (!parsed.success) {
    return buildRedirect(rawRedirectTo, request, "error", "Please complete all of the required fields.");
  }

  const published = formData.get("published") === "on";
  const featured = formData.get("featured") === "on";
  const spotlight = formData.get("spotlight") === "on";

  try {
    const savedStory = await saveStory({
      id: parsed.data.postId || undefined,
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt,
      body: parsed.data.body,
      category: parsed.data.category,
      coverImage: parsed.data.coverImage,
      trailerUrl: parsed.data.trailerUrl,
      featured,
      spotlight,
      published,
    });

    revalidatePath("/");
    revalidatePath("/stories");
    revalidatePath(`/stories/${savedStory.slug}`);
    revalidatePath("/admin");

    return buildRedirect("/admin", request, "success", "Story saved successfully.");
  } catch (error) {
    if (error instanceof Error && error.message === "DUPLICATE_SLUG") {
      return buildRedirect(rawRedirectTo, request, "error", "That slug is already in use. Pick a different one.");
    }

    if (error instanceof Error && error.message === "NOT_FOUND") {
      return buildRedirect("/admin", request, "error", "That story no longer exists.");
    }

    throw error;
  }
}
