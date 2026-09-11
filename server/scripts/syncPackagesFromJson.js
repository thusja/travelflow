import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v5 as uuidv5 } from "uuid";
import prisma from "../db/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JSON_SOURCE = path.join(__dirname, "../data/packages.json");
const NAMESPACE = "66d79e9f-4303-4f72-97f8-4cdcc04f3b44";

const rows = JSON.parse(fs.readFileSync(JSON_SOURCE, "utf-8"));

try {
  for (const row of rows) {
    const id = uuidv5(`legacy-package-${row.id}`, NAMESPACE);

    await prisma.package.upsert({
      where: { id },
      create: {
        id,
        title: row.title,
        description: row.description || null,
        price:
          row.price === null || row.price === undefined
            ? null
            : Number(row.price),
        imageUrl: row.thumbnail || null,
      },
      update: {
        title: row.title,
        description: row.description || null,
        price:
          row.price === null || row.price === undefined
            ? null
            : Number(row.price),
        imageUrl: row.thumbnail || null,
      },
    });
  }

  console.log(`synced ${rows.length} packages`);
} catch (error) {
  console.error("failed to sync packages:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
