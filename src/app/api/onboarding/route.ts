import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { setSession, getSession } from "@/lib/session";
import { parseListing, parseProfile } from "@/lib/validators";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.loginId && !session?.userId) return jsonError("Verify your phone or email first.", 401);
  const body = await request.json().catch(() => null);
  const parsed = parseProfile(body);
  if (!parsed.ok) return jsonError(parsed.error);

  let loginId = session.loginId || "";
  if (session.userId) {
    const existing = await prisma.user.findUnique({ where: { id: session.userId } });
    if (existing) loginId = existing.loginId;
  }
  if (!loginId) return jsonError("Verify your phone or email first.", 401);

  const phone = loginId.startsWith("email:") ? "" : loginId;
  const email = loginId.startsWith("email:") ? loginId.slice(6) : "";
  const profile = parsed.value;
  const user = await prisma.user.upsert({
    where: { loginId },
    update: { ...profile, phone, email },
    create: { loginId, phone, email, ...profile },
  });
  await setSession({ userId: user.id, loginId });

  const rawListing = body && typeof body === "object" ? (body as { listing?: unknown }).listing : null;
  if (rawListing && (user.role === "lister" || user.role === "both")) {
    const listing = parseListing(rawListing);
    if (!listing.ok) return jsonError(listing.error);
    await prisma.listing.create({ data: { ...listing.value, userId: user.id } });
  }

  return NextResponse.json({ ok: true });
}
