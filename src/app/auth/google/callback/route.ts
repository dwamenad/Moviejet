import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import {
  getGoogleAdminConfig,
  getGoogleJwkSet,
  getGoogleOauthRedirectUri,
  getGoogleOpenIdConfiguration,
  getRequestOrigin,
  getSessionCookieOptions,
  googleOauthNonceCookieName,
  googleOauthStateCookieName,
  isAllowedGoogleAdminEmail,
  issueSessionToken,
  sessionCookieName,
} from "@/lib/auth";

function clearOauthCookies(response: NextResponse) {
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
}

function redirectToLogin(request: NextRequest, error: string) {
  const response = NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, request.url));
  clearOauthCookies(response);
  return response;
}

export async function GET(request: NextRequest) {
  const google = getGoogleAdminConfig();

  if (!google.configured) {
    return redirectToLogin(request, "Google sign-in is not configured");
  }

  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return redirectToLogin(request, `Google sign-in failed: ${error.replaceAll("_", " ")}`);
  }

  const state = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  const expectedState = request.cookies.get(googleOauthStateCookieName)?.value;
  const expectedNonce = request.cookies.get(googleOauthNonceCookieName)?.value;

  if (!state || !expectedState || state !== expectedState) {
    return redirectToLogin(request, "Google sign-in state did not match");
  }

  if (!code || !expectedNonce) {
    return redirectToLogin(request, "Google sign-in response was incomplete");
  }

  try {
    const configuration = await getGoogleOpenIdConfiguration();
    const origin = getRequestOrigin(request.headers, request.nextUrl.origin);
    const redirectUri = getGoogleOauthRedirectUri(origin);
    const tokenResponse = await fetch(configuration.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: google.clientId,
        client_secret: google.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Google token exchange failed (${tokenResponse.status}).`);
    }

    const tokenData = (await tokenResponse.json()) as {
      id_token?: unknown;
    };
    const idToken = tokenData.id_token;

    if (typeof idToken !== "string" || idToken.length === 0) {
      throw new Error("Google token response did not include an ID token.");
    }

    const jwkSet = await getGoogleJwkSet();
    const { payload } = await jwtVerify(idToken, jwkSet, {
      audience: google.clientId,
      issuer: [configuration.issuer, "accounts.google.com"],
    });

    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : null;

    if (typeof payload.nonce !== "string" || payload.nonce !== expectedNonce) {
      throw new Error("Google sign-in nonce did not match.");
    }

    if (!email || payload.email_verified !== true) {
      throw new Error("Google account email is missing or unverified.");
    }

    if (!isAllowedGoogleAdminEmail(email)) {
      return redirectToLogin(request, "This Google account is not allowed to access the admin");
    }

    const sessionToken = await issueSessionToken(email);
    const response = NextResponse.redirect(new URL("/admin", request.url));

    response.cookies.set({
      name: sessionCookieName,
      value: sessionToken,
      ...getSessionCookieOptions(),
      maxAge: 60 * 60 * 24 * 7,
    });

    clearOauthCookies(response);
    return response;
  } catch (error) {
    console.error(error);
    return redirectToLogin(request, "Google sign-in could not be completed");
  }
}
