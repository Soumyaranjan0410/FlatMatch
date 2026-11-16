import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { getSession } from "@/lib/session";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.userId && !session?.loginId) return jsonError("Sign in to continue.", 401);
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return jsonError("Choose an image.");
  const ext = TYPES[file.type];
  if (!ext) return jsonError("Use a JPG, PNG or WebP.");
  if (file.size > 4 * 1024 * 1024) return jsonError("Keep photos under 4 MB.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const name = `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return NextResponse.json({ url: `/uploads/${name}` });
}
