import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const ALLOWED_TYPES = ["jpeg", "jpg", "png", "exr", "blend", "alm", "fbx", "obj", "gif", "webp", "pdf", "glb", "gltf"];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const folder = (formData.get("folder") as string) ?? "uploads";
  const files: File[] = [];

  for (const [, value] of formData.entries()) {
    if (value instanceof File) files.push(value);
  }

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const uploaded: Array<{ name: string; path: string; size: number; type: string }> = [];
  const storageDir = path.join(process.cwd(), "storage", folder);

  if (!existsSync(storageDir)) {
    await mkdir(storageDir, { recursive: true });
  }

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) continue;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_TYPES.includes(ext)) continue;

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(storageDir, safeName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    uploaded.push({
      name: file.name,
      path: `${folder}/${safeName}`,
      size: file.size,
      type: ext,
    });
  }

  return NextResponse.json({ files: uploaded });
}
