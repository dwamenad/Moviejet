import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { sessionCookieName, verifySessionToken } from "@/lib/auth";
import { deleteStory } from "@/lib/content";

type DeleteRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, { params }: DeleteRouteProps) {
  const session = await verifySessionToken(request.cookies.get(sessionCookieName)?.value);

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
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

  const redirectUrl = new URL("/admin", request.url);
  redirectUrl.searchParams.set("success", "Story deleted.");

  return NextResponse.redirect(redirectUrl);
}
