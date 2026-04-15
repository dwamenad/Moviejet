import { NextRequest, NextResponse } from "next/server";
import {
  getAdminIdentity,
  issueSessionToken,
  sessionCookieName,
  validateAdminCredentials,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const admin = getAdminIdentity();

  if (!admin.configured) {
    return NextResponse.redirect(new URL("/login?error=Admin+credentials+are+not+configured", request.url));
  }

  const valid = await validateAdminCredentials(email, password);

  if (!valid) {
    return NextResponse.redirect(new URL("/login?error=Invalid+email+or+password", request.url));
  }

  const token = await issueSessionToken(email);
  const response = NextResponse.redirect(new URL("/admin", request.url));

  response.cookies.set({
    name: sessionCookieName,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
