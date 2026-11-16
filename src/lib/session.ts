import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "flatmatch_session";

export type SessionPayload = {
  userId?: string;
  loginId?: string;
  exp: number;
};

function secret() {
  return process.env.SESSION_SECRET || "flatmatch-local-dev-secret";
}

export function signSession(data: Omit<SessionPayload, "exp">, days = 30) {
  const payload = Buffer.from(
    JSON.stringify({ ...data, exp: Date.now() + days * 24 * 60 * 60 * 1000 }),
  ).toString("base64url");
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function readSessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as SessionPayload;
    if (!data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getSession() {
  const jar = await cookies();
  return readSessionToken(jar.get(SESSION_COOKIE)?.value);
}

export async function setSession(data: Omit<SessionPayload, "exp">) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, signSession(data), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
