import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { toMe } from "@/lib/serializers";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session?.userId && !session?.loginId) return jsonError("Sign in to continue.", 401);
  if (!session.userId) {
    const email = session.loginId?.startsWith("email:") ? session.loginId.slice(6) : "";
    const phone = email ? "" : session.loginId || "";
    return NextResponse.json({ stage: "onboarding", phone, email });
  }
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return jsonError("Sign in to continue.", 401);
  if (!user.onboardingDone) {
    return NextResponse.json({ stage: "onboarding", phone: user.phone, email: user.email, user: toMe(user, 0, 0) });
  }
  const [matchCount, listingCount] = await Promise.all([
    prisma.match.count({ where: { OR: [{ userLowId: user.id }, { userHighId: user.id }] } }),
    prisma.listing.count({ where: { userId: user.id, active: true } }),
  ]);
  return NextResponse.json({ stage: "app", user: toMe(user, matchCount, listingCount) });
}
