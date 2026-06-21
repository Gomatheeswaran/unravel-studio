import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter } as never) as unknown as {
  user: { upsert: (...args: unknown[]) => Promise<unknown> };
  servicePackage: { upsert: (...args: unknown[]) => Promise<unknown> };
  $disconnect: () => Promise<void>;
};

async function main() {
  const hashedPassword = await bcrypt.hash("R@m456kumar@456", 12);

  await prisma.user.upsert({
    where: { email: "admin@unravelstudio.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@unravelstudio.com",
      password: hashedPassword,
      role: "admin",
    },
  });

  const packages = [
    {
      tier: "basic",
      name: "Basic Package",
      price: 149,
      description: "Perfect for simple 3D assets and basic character models.",
      workCoverage: JSON.stringify([
        "1 character or object model",
        "Basic texturing",
        "2 revisions included",
        "7-day delivery",
        ".OBJ and .FBX export",
      ]),
      deliveryDays: 7,
      revisions: 2,
    },
    {
      tier: "standard",
      name: "Standard Package",
      price: 349,
      description: "Ideal for detailed assets with full texturing and rigging.",
      workCoverage: JSON.stringify([
        "Up to 3 character or environment assets",
        "Full PBR texturing",
        "Basic rigging & skinning",
        "4 revisions included",
        "14-day delivery",
        ".OBJ, .FBX, and .BLEND export",
      ]),
      deliveryDays: 14,
      revisions: 4,
    },
    {
      tier: "premium",
      name: "Premium Package",
      price: 799,
      description: "Complete production-ready pipeline with animations and full asset packs.",
      workCoverage: JSON.stringify([
        "Unlimited assets in scope",
        "Full PBR + HDRI lighting",
        "Advanced rigging & animations",
        "Sculpted details & displacement maps",
        "Unlimited revisions",
        "21-day delivery",
        "All formats: .OBJ, .FBX, .BLEND, .EXR, .ALM",
        "Source files included",
      ]),
      deliveryDays: 21,
      revisions: 99,
    },
  ];

  for (const pkg of packages) {
    await prisma.servicePackage.upsert({
      where: { tier: pkg.tier },
      update: pkg,
      create: pkg,
    });
  }

  console.log("Seed complete: admin user + 3 service packages created.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
