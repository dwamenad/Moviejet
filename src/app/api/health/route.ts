import { NextResponse } from "next/server";
import { getAdminStories, getDataFilePath } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET() {
  const stories = await getAdminStories();

  return NextResponse.json({
    ok: true,
    stories: stories.length,
    dataFile: getDataFilePath(),
    timestamp: new Date().toISOString(),
  });
}
