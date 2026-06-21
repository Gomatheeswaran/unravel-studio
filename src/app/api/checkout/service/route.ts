import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { packageId, projectDetails, referenceFiles } = await req.json();

  const pkg = await prisma.servicePackage.findUnique({ where: { id: packageId } });
  if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      packageId,
      status: "paid",
      projectDetails: JSON.stringify(projectDetails),
      totalAmount: pkg.price,
      paymentId: `demo_${Date.now()}`,
      referenceFiles: {
        create: (referenceFiles ?? []).map((f: { name: string; path: string; size: number }) => ({
          fileName: f.name,
          filePath: f.path,
          fileType: f.name.split(".").pop() ?? "file",
          fileSize: f.size,
        })),
      },
    },
  });

  return NextResponse.json({ orderId: order.id });
}
