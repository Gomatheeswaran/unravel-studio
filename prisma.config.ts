import "dotenv/config";
import path from "path";
import { defineConfig } from "prisma/config";

const defaultDbUrl = `file:${path.join(process.cwd(), "dev.db")}`;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] ?? defaultDbUrl,
  },
});
