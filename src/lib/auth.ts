import { compare } from "bcryptjs";
import { createRemoteJWKSet, jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const sessionCookieName = "moviejet_session";
export const googleOauthStateCookieName = "moviejet_google_oauth_state";
export const googleOauthNonceCookieName = "moviejet_google_oauth_nonce";

type SessionPayload = {
  email: string;
};

type GoogleOpenIdConfiguration = {
  authorizationEndpoint: string;
  issuer: string;
  jwksUri: string;
  tokenEndpoint: string;
};

type PasswordAdminConfig = {
  configured: boolean;
  emails: string[];
  primaryEmail: string;
};

type GoogleAdminConfig = {
  allowedEmails: string[];
  clientId: string;
  clientSecret: string;
  configured: boolean;
  hostedDomain: string | null;
  redirectUri: string | null;
};

const encoder = new TextEncoder();
const googleOpenIdConfigurationUrl = "https://accounts.google.com/.well-known/openid-configuration";
let cachedGoogleOpenIdConfiguration: GoogleOpenIdConfiguration | null = null;
let cachedGoogleJwkSet:
  | ReturnType<typeof createRemoteJWKSet>
  | null = null;

function getSessionSecret() {
  return encoder.encode(process.env.SESSION_SECRET ?? "moviejet-local-session-secret");
}

function parseEmailList(rawValue?: string | null) {
  return [...new Set((rawValue ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean))];
}

function getConfiguredAdminEmails() {
  const configuredEmails = parseEmailList(process.env.ADMIN_EMAILS);

  if (configuredEmails.length > 0) {
    return configuredEmails;
  }

  return parseEmailList(process.env.ADMIN_EMAIL ?? "admin@moviejet.local");
}

export function getPasswordAdminConfig(): PasswordAdminConfig {
  const emails = getConfiguredAdminEmails();

  return {
    configured: emails.length > 0 && Boolean(process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD_HASH),
    emails,
    primaryEmail: emails[0] ?? "admin@moviejet.local",
  };
}

export async function validateAdminCredentials(email: string, password: string) {
  const admin = getPasswordAdminConfig();

  if (!admin.configured || !admin.emails.includes(email.trim().toLowerCase())) {
    return false;
  }

  if (process.env.ADMIN_PASSWORD_HASH) {
    return compare(password, process.env.ADMIN_PASSWORD_HASH);
  }

  return password === process.env.ADMIN_PASSWORD;
}

export async function issueSessionToken(email: string) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSessionSecret());
}

export async function verifySessionToken(token?: string | null): Promise<SessionPayload | null> {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSessionSecret());

    if (typeof payload.email !== "string") {
      return null;
    }

    return { email: payload.email };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(sessionCookieName)?.value);
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export function getGoogleAdminConfig(): GoogleAdminConfig {
  const googleAllowedEmails = parseEmailList(process.env.GOOGLE_ADMIN_EMAILS);
  const allowedEmails =
    googleAllowedEmails.length > 0 ? googleAllowedEmails : getConfiguredAdminEmails();
  const clientId = (process.env.GOOGLE_CLIENT_ID ?? "").trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET ?? "").trim();
  const hostedDomain = (process.env.GOOGLE_WORKSPACE_DOMAIN ?? "").trim() || null;
  const redirectUri = (process.env.GOOGLE_OAUTH_REDIRECT_URI ?? "").trim() || null;

  return {
    allowedEmails,
    clientId,
    clientSecret,
    configured: allowedEmails.length > 0 && Boolean(clientId && clientSecret),
    hostedDomain,
    redirectUri,
  };
}

export function getGoogleOauthRedirectUri(origin: string) {
  const configuredRedirectUri = getGoogleAdminConfig().redirectUri;
  return configuredRedirectUri ?? `${origin}/auth/google/callback`;
}

export function isAllowedGoogleAdminEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return getGoogleAdminConfig().allowedEmails.includes(normalizedEmail);
}

function readRequiredString(
  data: Record<string, unknown>,
  key: string,
) {
  const value = data[key];

  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Google OpenID configuration is missing ${key}.`);
  }

  return value;
}

export async function getGoogleOpenIdConfiguration() {
  if (cachedGoogleOpenIdConfiguration) {
    return cachedGoogleOpenIdConfiguration;
  }

  const response = await fetch(googleOpenIdConfigurationUrl, {
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error(`Failed to load Google OpenID configuration (${response.status}).`);
  }

  const data = (await response.json()) as Record<string, unknown>;

  cachedGoogleOpenIdConfiguration = {
    authorizationEndpoint: readRequiredString(data, "authorization_endpoint"),
    issuer: readRequiredString(data, "issuer"),
    jwksUri: readRequiredString(data, "jwks_uri"),
    tokenEndpoint: readRequiredString(data, "token_endpoint"),
  };

  return cachedGoogleOpenIdConfiguration;
}

export async function getGoogleJwkSet() {
  if (cachedGoogleJwkSet) {
    return cachedGoogleJwkSet;
  }

  const configuration = await getGoogleOpenIdConfiguration();
  cachedGoogleJwkSet = createRemoteJWKSet(new URL(configuration.jwksUri));
  return cachedGoogleJwkSet;
}
