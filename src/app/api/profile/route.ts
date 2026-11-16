import { NextResponse } from "next/server";
import { currentUser, jsonError } from "@/lib/http";
import { prisma } from "@/lib/db";
import { toMe } from "@/lib/serializers";
import { parseProfile } from "@/lib/validators";

export async function PATCH(request: Request) {
  const user = await currentUser();
  if (!user) return jsonError("Sign in to continue.", 401);
  const body = await request.json().catch(() => null);
  const parsed = parseProfile(body);
  if (!parsed.ok) return jsonError(parsed.error);
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: parsed.value,
  });
  const [matchCount, listingCount] = await Promise.all([
    prisma.match.count({ where: { OR: [{ userLowId: user.id }, { userHighId: user.id }] } }),
    prisma.listing.count({ where: { userId: user.id, active: true } }),
  ]);
  return NextResponse.json({ user: toMe(updated, matchCount, listingCount) });
}
