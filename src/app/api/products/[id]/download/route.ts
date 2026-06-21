import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("fileId");

  const product = await prisma.product.findUnique({
    where: { id },
    include: { files: true },
  });

  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  if (!product.isFree) {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    const purchased = await prisma.purchaseItem.findFirst({
      where: { productId: id, purchase: { userId: session.user.id } },
    });

    if (!purchased) {
      return NextResponse.json({ error: "Purchase required" }, { status: 403 });
    }
  }

  const file = fileId
    ? product.files.find((f) => f.id === fileId)
    : product.files[0];

  if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });

  const filePath = path.join(process.cwd(), "storage", file.filePath);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not on disk" }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Disposition": `attachment; filename="${file.fileName}"`,
      "Content-Type": "application/octet-stream",
      "Content-Length": String(fileBuffer.length),
    },
  });
}
