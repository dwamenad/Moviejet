import { NextRequest, NextResponse } from "next/server";
import {
  getRequestOrigin,
  getPasswordAdminConfig,
  getSessionCookieOptions,
  issueSessionToken,
  sessionCookieName,
  validateAdminCredentials,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const origin = getRequestOrigin(request.headers, request.nextUrl.origin);
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const admin = getPasswordAdminConfig();

  if (!admin.configured) {
    return NextResponse.redirect(new URL("/login?error=Admin+credentials+are+not+configured", origin));
  }

  const valid = await validateAdminCredentials(email, password);

  if (!valid) {
    return NextResponse.redirect(new URL("/login?error=Invalid+email+or+password", origin));
  }

  const token = await issueSessionToken(email);
  const response = NextResponse.redirect(new URL("/admin", origin));

  response.cookies.set({
    name: sessionCookieName,
    value: token,
    ...getSessionCookieOptions(),
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
