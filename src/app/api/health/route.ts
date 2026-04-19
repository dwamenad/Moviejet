import { NextResponse } from "next/server";
import { getAdminStories, getDataFilePath, getStorageMode } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET() {
  const stories = await getAdminStories();
  const storageMode = getStorageMode();

  return NextResponse.json({
    ok: true,
    stories: stories.length,
    storageMode,
    databaseEnabled: storageMode === "database",
    dataFile: getDataFilePath(),
    timestamp: new Date().toISOString(),
  });
}
