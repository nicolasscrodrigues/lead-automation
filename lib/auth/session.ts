import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getEnv } from "@/lib/env";

export const SESSION_COOKIE_NAME = "lead_automation_session";
const SESSION_DURATION_SECONDS = 8 * 60 * 60; // 8 hours

function getSecretKey(): Uint8Array {
  const { SESSION_SECRET } = getEnv(["SESSION_SECRET"]);
  return new TextEncoder().encode(SESSION_SECRET);
}

export async function signSessionToken(username: string): Promise<string> {
  const secretKey = getSecretKey();
  return new SignJWT({ sub: username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secretKey);
}

export async function verifySession(
  token?: string
): Promise<{ username: string } | null> {
  try {
    let tokenToVerify = token;
    if (tokenToVerify === undefined) {
      const cookieStore = await cookies();
      tokenToVerify = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    }

    if (!tokenToVerify) {
      return null;
    }

    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(tokenToVerify, secretKey, {
      algorithms: ["HS256"],
    });

    if (typeof payload.sub !== "string" || !payload.sub) {
      return null;
    }

    return { username: payload.sub };
  } catch {
    return null;
  }
}

export async function createSession(username: string): Promise<string> {
  const token = await signSessionToken(username);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });

  return token;
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
