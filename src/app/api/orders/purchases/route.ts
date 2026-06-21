import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ purchased: false });

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (!productId) return NextResponse.json({ purchased: false });

  const item = await prisma.purchaseItem.findFirst({
    where: { productId, purchase: { userId: session.user.id } },
  });

  return NextResponse.json({ purchased: !!item });
}
