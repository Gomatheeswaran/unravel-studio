import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const total = cartItems.reduce((sum, item) => sum + item.product.price, 0);

  // In production, create a real Stripe PaymentIntent here.
  // For demo mode, we directly create the purchase record.
  const purchase = await prisma.purchase.create({
    data: {
      userId: session.user.id,
      paymentId: `demo_${Date.now()}`,
      totalAmount: total,
      items: {
        create: cartItems.map((item) => ({
          productId: item.productId,
          priceAtPurchase: item.product.price,
        })),
      },
    },
  });

  await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });

  return NextResponse.json({ purchaseId: purchase.id, total });
}
