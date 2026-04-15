import { compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const sessionCookieName = "moviejet_session";

type SessionPayload = {
  email: string;
};

const encoder = new TextEncoder();

function getSessionSecret() {
  return encoder.encode(process.env.SESSION_SECRET ?? "moviejet-local-session-secret");
}

export function getAdminIdentity() {
  return {
    email: (process.env.ADMIN_EMAIL ?? "admin@moviejet.local").trim().toLowerCase(),
    configured: Boolean(process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD_HASH),
  };
}

export async function validateAdminCredentials(email: string, password: string) {
  const admin = getAdminIdentity();

  if (!admin.configured || email.trim().toLowerCase() !== admin.email) {
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
