import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { setSession } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const loginId = String(body?.loginId || "");
  const user = await prisma.user.findUnique({ where: { loginId } });
  if (!user?.isSeed || !user.onboardingDone) return jsonError("That demo profile is not available.", 404);
  await setSession({ userId: user.id, loginId: user.loginId });
  return NextResponse.json({ next: "discover" });
}
