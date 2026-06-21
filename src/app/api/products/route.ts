import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const isFree = searchParams.get("free");

  const where: Record<string, unknown> = { published: true };
  if (category) where.category = category;
  if (isFree === "true") where.isFree = true;
  if (isFree === "false") where.isFree = false;
  if (search) where.name = { contains: search };

  const products = await prisma.product.findMany({
    where,
    include: { files: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { name, description, price, isFree, category, tags, thumbnail, images, model3dUrl } = body;

  if (!name || !description || !thumbnail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const baseSlug = slugify(name);
  let slug = baseSlug;
  let i = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      price: isFree ? 0 : (parseFloat(price) || 0),
      isFree: Boolean(isFree),
      category: category ?? null,
      tags: tags ? JSON.stringify(tags) : null,
      thumbnail,
      images: JSON.stringify(images ?? []),
      model3dUrl: model3dUrl ?? null,
      published: true,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
