import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  getGoogleAdminConfig,
  getGoogleOauthRedirectUri,
  getGoogleOpenIdConfiguration,
  getRequestOrigin,
  getSessionCookieOptions,
  googleOauthNonceCookieName,
  googleOauthStateCookieName,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  const google = getGoogleAdminConfig();
  const origin = getRequestOrigin(request.headers, request.nextUrl.origin);

  if (!google.configured) {
    return NextResponse.redirect(new URL("/login?error=Google+sign-in+is+not+configured", origin));
  }

  const state = randomBytes(24).toString("base64url");
  const nonce = randomBytes(24).toString("base64url");
  const configuration = await getGoogleOpenIdConfiguration();
  const redirectUri = getGoogleOauthRedirectUri(origin);
  const authorizationUrl = new URL(configuration.authorizationEndpoint);

  authorizationUrl.search = new URLSearchParams({
    client_id: google.clientId,
    nonce,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
  }).toString();

  if (google.hostedDomain) {
    authorizationUrl.searchParams.set("hd", google.hostedDomain);
  }

  const response = NextResponse.redirect(authorizationUrl);

  response.cookies.set({
    name: googleOauthStateCookieName,
    value: state,
    ...getSessionCookieOptions(),
    maxAge: 60 * 10,
  });

  response.cookies.set({
    name: googleOauthNonceCookieName,
    value: nonce,
    ...getSessionCookieOptions(),
    maxAge: 60 * 10,
  });

  return response;
}
