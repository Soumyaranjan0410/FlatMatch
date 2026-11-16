import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { genderAllowed, womenOnlyAllows } from "./matchmaking";
import { toListing, toPerson } from "./serializers";

async function presentMatch(matchId: string, meId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return null;
  const otherId = match.userLowId === meId ? match.userHighId : match.userLowId;
  const [other, listing] = await Promise.all([
    prisma.user.findUnique({ where: { id: otherId } }),
    match.listingId ? prisma.listing.findUnique({ where: { id: match.listingId } }) : Promise.resolve(null),
  ]);
  if (!other) return null;
  return {
    id: match.id,
    other: toPerson(other),
    listing: listing ? toListing(listing) : null,
  };
}

async function reciprocal(otherId: string, meId: string) {
  const likedProfile = await prisma.swipe.findFirst({
    where: { swiperId: otherId, direction: "like", targetType: "user", targetId: meId },
  });
  if (likedProfile) return true;
  const listings = await prisma.listing.findMany({ where: { userId: meId, active: true }, select: { id: true } });
  if (listings.length === 0) return false;
  const likedListing = await prisma.swipe.findFirst({
    where: {
      swiperId: otherId,
      direction: "like",
      targetType: "listing",
      targetId: { in: listings.map((listing) => listing.id) },
    },
  });
  return Boolean(likedListing);
}

export async function applySwipe(
  userId: string,
  targetType: "user" | "listing",
  targetId: string,
  direction: "like" | "pass",
) {
  const me = await prisma.user.findUnique({ where: { id: userId } });
  if (!me?.onboardingDone) throw new Error("Finish your profile first.");

  let otherId = "";
  let listingId = "";

  if (targetType === "listing") {
    const listing = await prisma.listing.findUnique({ where: { id: targetId }, include: { user: true } });
    if (!listing?.active) throw new Error("That listing is no longer available.");
    if (listing.userId === me.id) throw new Error("That's your own listing.");
    if (!womenOnlyAllows(me, listing.user)) throw new Error("Women-only mode hides this profile.");
    if (!genderAllowed(me.gender, listing.genderPreference)) throw new Error("This listing isn't open to you.");
    otherId = listing.userId;
    listingId = listing.id;
  } else {
    const other = await prisma.user.findUnique({ where: { id: targetId } });
    if (!other?.onboardingDone) throw new Error("That profile is unavailable.");
    if (other.id === me.id) throw new Error("That's you.");
    if (!womenOnlyAllows(me, other)) throw new Error("Women-only mode hides this profile.");
    otherId = other.id;
  }

  const blocked = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: me.id, blockedId: otherId },
        { blockerId: otherId, blockedId: me.id },
      ],
    },
  });
  if (blocked) throw new Error("This person is blocked.");

  await prisma.swipe.upsert({
    where: { swiperId_targetType_targetId: { swiperId: me.id, targetType, targetId } },
    update: { direction },
    create: { swiperId: me.id, targetType, targetId, direction },
  });

  if (direction !== "like") return { matched: false as const };

  const [low, high] = me.id < otherId ? [me.id, otherId] : [otherId, me.id];
  const existing = await prisma.match.findUnique({
    where: { userLowId_userHighId: { userLowId: low, userHighId: high } },
  });
  if (existing) {
    return { matched: true as const, already: true, match: await presentMatch(existing.id, me.id) };
  }

  const other = await prisma.user.findUnique({ where: { id: otherId } });
  const likedBack = Boolean(other?.likesBack) || (await reciprocal(otherId, me.id));
  if (!likedBack) return { matched: false as const };

  if (!listingId) {
    const theirListing = await prisma.listing.findFirst({
      where: { userId: otherId, active: true },
      orderBy: { createdAt: "asc" },
    });
    listingId = theirListing?.id || "";
  }

  try {
    const match = await prisma.match.create({
      data: { userLowId: low, userHighId: high, listingId },
    });
    return { matched: true as const, already: false, match: await presentMatch(match.id, me.id) };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const raced = await prisma.match.findUnique({
        where: { userLowId_userHighId: { userLowId: low, userHighId: high } },
      });
      if (raced) return { matched: true as const, already: true, match: await presentMatch(raced.id, me.id) };
    }
    throw error;
  }
}
