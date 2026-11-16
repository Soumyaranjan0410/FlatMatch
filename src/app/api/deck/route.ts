import { NextResponse } from "next/server";
import { buildDeck } from "@/lib/deck";
import { currentUser, jsonError } from "@/lib/http";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user?.onboardingDone) return jsonError("Sign in to continue.", 401);
  const url = new URL(request.url);
  const deck = await buildDeck(user, url.searchParams);
  return NextResponse.json(deck);
}
