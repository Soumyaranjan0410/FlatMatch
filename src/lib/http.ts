import { NextResponse } from "next/server";
import { prisma } from "./db";
import { getSession } from "./session";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function currentUser() {
  const session = await getSession();
  if (!session?.userId) return null;
  return prisma.user.findUnique({ where: { id: session.userId } });
}
