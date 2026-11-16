import { NextResponse } from "next/server";
import { DEMO_AADHAAR, DEMO_OTP } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { currentUser, jsonError } from "@/lib/http";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user?.onboardingDone) return jsonError("Sign in to continue.", 401);
  const body = await request.json().catch(() => null);
  const aadhaar = String(body?.demoAadhaar || "").replace(/\s/g, "");
  const otp = String(body?.otp || "").replace(/\s/g, "");
  if (aadhaar !== DEMO_AADHAAR) {
    return jsonError("This is a mock check. Use the demo number 1234 1234 1234. Do not enter a real Aadhaar.");
  }
  if (otp !== DEMO_OTP) return jsonError("The demo OTP is 123456. Nothing was sent to DigiLocker.");
  await prisma.user.update({ where: { id: user.id }, data: { verified: true } });
  return NextResponse.json({ verified: true });
}
