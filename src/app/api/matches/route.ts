import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser, jsonError } from "@/lib/http";
import { toMatchPreview } from "@/lib/serializers";

export async function GET() {
  const user = await currentUser();
  if (!user?.onboardingDone) return jsonError("Sign in to continue.", 401);
  const [matches, blocks] = await Promise.all([
    prisma.match.findMany({
      where: { OR: [{ userLowId: user.id }, { userHighId: user.id }] },
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.block.findMany({
      where: { OR: [{ blockerId: user.id }, { blockedId: user.id }] },
    }),
  ]);
  const blocked = new Set(blocks.map((block) => (block.blockerId === user.id ? block.blockedId : block.blockerId)));
  const otherIds = matches.map((match) => (match.userLowId === user.id ? match.userHighId : match.userLowId));
  const listingIds = matches.map((match) => match.listingId).filter(Boolean);
  const [others, listings] = await Promise.all([
    prisma.user.findMany({ where: { id: { in: otherIds } } }),
    prisma.listing.findMany({ where: { id: { in: listingIds } } }),
  ]);
  const otherById = new Map(others.map((other) => [other.id, other]));
  const listingById = new Map(listings.map((listing) => [listing.id, listing]));

  const previews = matches
    .map((match) => {
      const otherId = match.userLowId === user.id ? match.userHighId : match.userLowId;
      const other = otherById.get(otherId);
      if (!other) return null;
      const last = match.messages[0];
      return toMatchPreview(
        match.id,
        other,
        match.listingId ? listingById.get(match.listingId) || null : null,
        last?.body || "You matched. Say hello.",
        last?.createdAt || match.createdAt,
        blocked.has(otherId),
      );
    })
    .filter((preview) => preview !== null)
    .sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1));

  return NextResponse.json({ matches: previews });
}
