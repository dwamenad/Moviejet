import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getRequestOrigin, sessionCookieName, verifySessionToken } from "@/lib/auth";
import { deleteStory } from "@/lib/content";
import { formatPublicSiteSyncMessage, syncPublicSite } from "@/lib/public-sync";

type DeleteRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, { params }: DeleteRouteProps) {
  const session = await verifySessionToken(request.cookies.get(sessionCookieName)?.value);
  const origin = getRequestOrigin(request.headers, request.nextUrl.origin);

  if (!session) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const { id } = await params;
  const formData = await request.formData();
  const slug = String(formData.get("slug") ?? "");

  await deleteStory(id);

  revalidatePath("/");
  revalidatePath("/stories");
  revalidatePath("/admin");

  if (slug) {
    revalidatePath(`/stories/${slug}`);
  }

  const syncResult = await syncPublicSite({
    reason: "story-deleted",
    slug: slug || undefined,
    storyId: id,
  });
  const redirectUrl = new URL("/admin", origin);
  redirectUrl.searchParams.set(
    "success",
    formatPublicSiteSyncMessage("Story deleted.", syncResult),
  );

  return NextResponse.redirect(redirectUrl);
}
