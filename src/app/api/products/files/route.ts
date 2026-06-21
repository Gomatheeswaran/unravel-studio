import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { productId, fileName, filePath, fileType, fileSize } = await req.json();

  const file = await prisma.productFile.create({
    data: { productId, fileName, filePath, fileType, fileSize: parseInt(fileSize) || 0 },
  });

  return NextResponse.json(file, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("id");
  if (!fileId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.productFile.delete({ where: { id: fileId } });
  return NextResponse.json({ success: true });
}
