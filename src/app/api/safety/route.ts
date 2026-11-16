import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser, jsonError } from "@/lib/http";

const KINDS = new Set(["concern", "broker", "fake", "harassment"]);

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return jsonError("Sign in to continue.", 401);
  const body = await request.json().catch(() => null);
  const action = body?.action === "block" ? "block" : body?.action === "report" ? "report" : "";
  const targetUserId = typeof body?.targetUserId === "string" ? body.targetUserId : "";
  if (!action || !targetUserId || targetUserId === user.id) return jsonError("Choose who you want to report.");
  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) return jsonError("That profile is no longer here.", 404);

  if (action === "report") {
    const kind = KINDS.has(body?.kind) ? body.kind : "concern";
    const reason = typeof body?.reason === "string" ? body.reason.trim().slice(0, 400) : "";
    if (reason.length < 3 && kind !== "broker") return jsonError("Add a short note so this report is useful.");
    await prisma.report.create({
      data: {
        reporterId: user.id,
        targetId: targetUserId,
        kind,
        reason: reason || "Reported as a broker.",
      },
    });
  }

  if (action === "block" || body?.alsoBlock) {
    await prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId: user.id, blockedId: targetUserId } },
      update: {},
      create: { blockerId: user.id, blockedId: targetUserId },
    });
  }

  return NextResponse.json({ ok: true });
}
