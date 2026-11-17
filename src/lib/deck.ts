import type { Listing, User } from "@prisma/client";
import { prisma } from "./db";
import {
  budgetOverlaps,
  compatibility,
  compatibilityNotes,
  defaultFilters,
  genderAllowed,
  listingDateOk,
  moveInClose,
  womenOnlyAllows,
} from "./matchmaking";
import { lifestyleOf, toListing, toPerson } from "./serializers";
import { CITIES } from "./constants";
import type { DeckCard, Filters } from "./types";

function readFilters(user: User, search: URLSearchParams): Filters {
  const base = defaultFilters(user);
  const city = search.get("city") || base.city;
  const gender = search.get("gender");
  const budgetMin = Number(search.get("budgetMin"));
  const budgetMax = Number(search.get("budgetMax"));
  const allowedCities = new Set<string>(["all", ...CITIES]);
  const filters: Filters = {
    city: allowedCities.has(city) ? city : base.city,
    budgetMin: Number.isFinite(budgetMin) && budgetMin > 0 ? budgetMin : base.budgetMin,
    budgetMax: Number.isFinite(budgetMax) && budgetMax > 0 ? budgetMax : base.budgetMax,
    gender: gender === "woman" || gender === "man" || gender === "any" ? gender : base.gender,
    moveInStrict: search.get("moveInStrict") !== "0",
    verifiedOnly: search.get("verifiedOnly") === "1",
  };
  if (filters.budgetMin > filters.budgetMax) {
    const swap = filters.budgetMin;
    filters.budgetMin = filters.budgetMax;
    filters.budgetMax = swap;
  }
  if (user.womenOnly) filters.gender = "woman";
  return filters;
}

function personVisible(viewer: User, other: User, filters: Filters) {
  if (!womenOnlyAllows(viewer, other)) return false;
  if (filters.gender === "woman" && other.gender !== "woman") return false;
  if (filters.gender === "man" && other.gender !== "man") return false;
  if (filters.city !== "all" && other.city !== filters.city) return false;
  if (!budgetOverlaps(filters.budgetMin, filters.budgetMax, other.budgetMin, other.budgetMax)) return false;
  if (filters.moveInStrict && !moveInClose(viewer.moveInDate, other.moveInDate, 75)) return false;
  if (filters.verifiedOnly && !other.verified) return false;
  return true;
}

function listingVisible(viewer: User, listing: Listing, owner: User, filters: Filters) {
  if (!womenOnlyAllows(viewer, owner)) return false;
  if (!genderAllowed(viewer.gender, listing.genderPreference)) return false;
  if (filters.gender === "woman" && (owner.gender !== "woman" || listing.genderPreference === "men")) return false;
  if (filters.gender === "man" && (owner.gender !== "man" || listing.genderPreference === "women")) return false;
  if (filters.city !== "all" && listing.city !== filters.city) return false;
  if (listing.rent < filters.budgetMin || listing.rent > filters.budgetMax) return false;
  if (!listingDateOk(listing.availableFrom, viewer.moveInDate, filters.moveInStrict)) return false;
  if (filters.verifiedOnly && !owner.verified) return false;
  return true;
}

export async function buildDeck(user: User, search: URLSearchParams) {
  const mode = search.get("mode") === "people" ? "people" : "rooms";
  const filters = readFilters(user, search);
  const [blocks, swipes, people, listings, brokerReports] = await Promise.all([
    prisma.block.findMany({
      where: { OR: [{ blockerId: user.id }, { blockedId: user.id }] },
    }),
    prisma.swipe.findMany({ where: { swiperId: user.id } }),
    prisma.user.findMany({ where: { onboardingDone: true, NOT: { id: user.id } } }),
    prisma.listing.findMany({ where: { active: true }, include: { user: true } }),
    prisma.report.findMany({ where: { kind: "broker" }, select: { targetId: true } }),
  ]);
  const brokerCounts = new Map<string, number>();
  for (const report of brokerReports) {
    brokerCounts.set(report.targetId, (brokerCounts.get(report.targetId) || 0) + 1);
  }
  const blocked = new Set(blocks.map((block) => (block.blockerId === user.id ? block.blockedId : block.blockerId)));
  const seen = new Set(swipes.map((swipe) => `${swipe.targetType}:${swipe.targetId}`));
  const mine = lifestyleOf(user);
  const cards: DeckCard[] = [];

  if (mode === "rooms") {
    for (const listing of listings) {
      if (listing.userId === user.id || blocked.has(listing.userId) || seen.has(`listing:${listing.id}`)) continue;
      if (!listingVisible(user, listing, listing.user, filters)) continue;
      const score = compatibility(mine, lifestyleOf(listing.user));
      cards.push({
        key: `listing:${listing.id}`,
        type: "listing",
        score,
        notes: compatibilityNotes(mine, lifestyleOf(listing.user)),
        brokerReports: brokerCounts.get(listing.userId) || 0,
        person: toPerson(listing.user),
        listing: toListing(listing),
        context: `${listing.user.name.split(" ")[0]} is listing this directly`,
      });
    }
  } else {
    const listingByUser = new Map<string, (typeof listings)[number]>();
    for (const listing of listings) {
      if (!listingByUser.has(listing.userId)) listingByUser.set(listing.userId, listing);
    }
    for (const other of people) {
      if (blocked.has(other.id) || seen.has(`user:${other.id}`)) continue;
      if (!personVisible(user, other, filters)) continue;
      const listing = listingByUser.get(other.id);
      const score = compatibility(mine, lifestyleOf(other));
      cards.push({
        key: `user:${other.id}`,
        type: "person",
        score,
        notes: compatibilityNotes(mine, lifestyleOf(other)),
        brokerReports: brokerCounts.get(other.id) || 0,
        person: toPerson(other),
        listing: listing ? toListing(listing) : null,
        context: listing
          ? `Has a ${listing.flatType === "PG" ? "PG bed" : listing.flatType === "coliving" ? "co-living spot" : listing.flatType.replace("BHK", " BHK")} in ${listing.locality}`
          : other.role === "lister"
            ? "Looking for the right flatmate"
            : "Looking for a room and a flatmate",
      });
    }
  }

  cards.sort((a, b) => {
    if (a.brokerReports !== b.brokerReports) return a.brokerReports - b.brokerReports;
    return b.score - a.score || a.person.name.localeCompare(b.person.name);
  });
  return { mode, filters, cards: cards.slice(0, 40) };
}
