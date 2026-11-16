import { NextResponse } from "next/server";
import { currentUser, jsonError } from "@/lib/http";
import { applySwipe } from "@/lib/swipe-service";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user?.onboardingDone) return jsonError("Sign in to continue.", 401);
  const body = await request.json().catch(() => null);
  const targetType = body?.targetType === "listing" ? "listing" : body?.targetType === "user" ? "user" : "";
  const targetId = typeof body?.targetId === "string" ? body.targetId : "";
  const direction = body?.direction === "like" || body?.direction === "pass" ? body.direction : "";
  if (!targetType || !targetId || !direction) return jsonError("That swipe was incomplete.");
  try {
    const result = await applySwipe(user.id, targetType, targetId, direction);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't save that swipe.";
    return jsonError(message);
  }
}
