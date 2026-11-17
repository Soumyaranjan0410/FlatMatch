import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser, jsonError } from "@/lib/http";
import { toListing, toMessage, toPerson } from "@/lib/serializers";

async function loadMatch(id: string, userId: string) {
  const match = await prisma.match.findUnique({ where: { id } });
  if (!match) return null;
  if (match.userLowId !== userId && match.userHighId !== userId) return null;
  return match;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return jsonError("Sign in to continue.", 401);
  const { id } = await context.params;
  const match = await loadMatch(id, user.id);
  if (!match) return jsonError("That chat isn't available.", 404);
  const otherId = match.userLowId === user.id ? match.userHighId : match.userLowId;
  const [other, listing, messages, block] = await Promise.all([
    prisma.user.findUnique({ where: { id: otherId } }),
    match.listingId ? prisma.listing.findUnique({ where: { id: match.listingId } }) : Promise.resolve(null),
    prisma.message.findMany({ where: { matchId: match.id }, orderBy: { createdAt: "asc" }, take: 200 }),
    prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: user.id, blockedId: otherId },
          { blockerId: otherId, blockedId: user.id },
        ],
      },
    }),
  ]);
  if (!other) return jsonError("That chat isn't available.", 404);
  return NextResponse.json({
    match: {
      id: match.id,
      other: toPerson(other),
      listing: listing ? toListing(listing) : null,
      blocked: Boolean(block),
      visitWhen: match.visitWhen,
      visitPlace: match.visitPlace,
      visitNote: match.visitNote,
    },
    messages: messages.map((message) => toMessage(message, user.id)),
  });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return jsonError("Sign in to continue.", 401);
  const { id } = await context.params;
  const match = await loadMatch(id, user.id);
  if (!match) return jsonError("That chat isn't available.", 404);
  const otherId = match.userLowId === user.id ? match.userHighId : match.userLowId;
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: user.id, blockedId: otherId },
        { blockerId: otherId, blockedId: user.id },
      ],
    },
  });
  if (block) return jsonError("This chat is closed because someone was blocked.");
  const body = await request.json().catch(() => null);
  const text = typeof body?.body === "string" ? body.body.trim().slice(0, 1000) : "";
  if (!text) return jsonError("Write a message first.");
  const message = await prisma.message.create({
    data: { matchId: match.id, senderId: user.id, body: text },
  });
  return NextResponse.json({ message: toMessage(message, user.id) });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return jsonError("Sign in to continue.", 401);
  const { id } = await context.params;
  const match = await loadMatch(id, user.id);
  if (!match) return jsonError("That chat isn't available.", 404);
  const body = await request.json().catch(() => null);
  const visitWhen = typeof body?.visitWhen === "string" ? body.visitWhen.trim().slice(0, 40) : "";
  const visitPlace = typeof body?.visitPlace === "string" ? body.visitPlace.trim().slice(0, 80) : "";
  const visitNote = typeof body?.visitNote === "string" ? body.visitNote.trim().slice(0, 240) : "";
  if (!visitWhen || !visitPlace) return jsonError("Add a time and a place for the visit.");
  const updated = await prisma.match.update({
    where: { id: match.id },
    data: { visitWhen, visitPlace, visitNote },
  });
  return NextResponse.json({
    visitWhen: updated.visitWhen,
    visitPlace: updated.visitPlace,
    visitNote: updated.visitNote,
  });
}
