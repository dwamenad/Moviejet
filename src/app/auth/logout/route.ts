import { NextRequest, NextResponse } from "next/server";
import {
  getSessionCookieOptions,
  googleOauthNonceCookieName,
  googleOauthStateCookieName,
  sessionCookieName,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));

  response.cookies.set({
    name: sessionCookieName,
    value: "",
    ...getSessionCookieOptions(),
    expires: new Date(0),
  });

  response.cookies.set({
    name: googleOauthStateCookieName,
    value: "",
    ...getSessionCookieOptions(),
    expires: new Date(0),
  });

  response.cookies.set({
    name: googleOauthNonceCookieName,
    value: "",
    ...getSessionCookieOptions(),
    expires: new Date(0),
  });

  return response;
}
