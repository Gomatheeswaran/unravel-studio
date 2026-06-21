import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (type === "purchases") {
    const purchases = await prisma.purchase.findMany({
      where: { userId: session.user.id },
      include: { items: { include: { product: { include: { files: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(purchases);
  }

  const where = session.user.role === "admin" ? {} : { userId: session.user.id };
  const orders = await prisma.order.findMany({
    where,
    include: { package: true, user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
