import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { setSession } from "@/lib/session";
import { normalizeLogin } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const login = normalizeLogin(String(body?.identifier || ""));
  const code = String(body?.code || "").replace(/\s/g, "");
  if (!login) return jsonError("Enter a valid Indian mobile number or email.");
  const challenge = await prisma.otpChallenge.findUnique({ where: { loginId: login.loginId } });
  if (!challenge || challenge.code !== code || challenge.expiresAt < new Date()) {
    return jsonError("That code didn't work. In this demo the code is 123456.");
  }

  let user = await prisma.user.findUnique({ where: { loginId: login.loginId } });
  if (!user && login.email) {
    user = await prisma.user.findFirst({ where: { email: login.email } });
  }
  if (user) {
    await setSession({ userId: user.id, loginId: user.loginId });
    return NextResponse.json({ next: user.onboardingDone ? "discover" : "onboarding" });
  }
  await setSession({ loginId: login.loginId });
  return NextResponse.json({ next: "onboarding" });
}
