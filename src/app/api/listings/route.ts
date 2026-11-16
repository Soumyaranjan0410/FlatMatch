import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser, jsonError } from "@/lib/http";
import { toListing } from "@/lib/serializers";
import { parseListing } from "@/lib/validators";

export async function GET() {
  const user = await currentUser();
  if (!user) return jsonError("Sign in to continue.", 401);
  const listings = await prisma.listing.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ listings: listings.map(toListing).map((listing, index) => ({ ...listing, active: listings[index].active })) });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user?.onboardingDone) return jsonError("Sign in to continue.", 401);
  if (user.role === "seeker") {
    await prisma.user.update({ where: { id: user.id }, data: { role: "both" } });
  }
  const body = await request.json().catch(() => null);
  const parsed = parseListing(body);
  if (!parsed.ok) return jsonError(parsed.error);
  const listing = await prisma.listing.create({ data: { ...parsed.value, userId: user.id } });
  return NextResponse.json({ listing: { ...toListing(listing), active: true } });
}

export async function PATCH(request: Request) {
  const user = await currentUser();
  if (!user) return jsonError("Sign in to continue.", 401);
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || listing.userId !== user.id) return jsonError("Listing not found.", 404);
  const updated = await prisma.listing.update({
    where: { id },
    data: { active: Boolean(body?.active) },
  });
  return NextResponse.json({ listing: { ...toListing(updated), active: updated.active } });
}
