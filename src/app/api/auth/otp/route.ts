import { NextResponse } from "next/server";
import { DEMO_OTP } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { normalizeLogin } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const login = normalizeLogin(String(body?.identifier || ""));
  if (!login) return jsonError("Enter a valid Indian mobile number or email.");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.otpChallenge.upsert({
    where: { loginId: login.loginId },
    update: { code: DEMO_OTP, expiresAt },
    create: { loginId: login.loginId, code: DEMO_OTP, expiresAt },
  });
  return NextResponse.json({
    ok: true,
    channel: login.channel,
    demoCode: DEMO_OTP,
    hint:
      login.channel === "email"
        ? "Demo mode: no email was sent. The code is 123456."
        : "Demo mode: no SMS was sent. The code is 123456.",
  });
}
