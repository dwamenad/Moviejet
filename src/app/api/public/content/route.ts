import { NextResponse } from "next/server";
import { getPublicContentPayload } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await getPublicContentPayload();

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
