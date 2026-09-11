import { spawnSync } from "node:child_process";
import path from "node:path";

function getArgValue(flag, fallback) {
  const index = process.argv.indexOf(flag);
  if (index !== -1 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }
  return fallback;
}

const sqlFile = getArgValue("--file", "sql/policies/20260618_rls_policies.sql");
const schemaName = getArgValue("--schema", "public");
const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!rawUrl) {
  console.error("DIRECT_URL or DATABASE_URL is required.");
  process.exit(1);
}

const parsed = new URL(rawUrl);
parsed.searchParams.set("schema", schemaName);

const env = {
  ...process.env,
  DATABASE_URL: parsed.toString(),
  DIRECT_URL: parsed.toString(),
};

const resolvedFile = path.resolve(process.cwd(), sqlFile);
const result = spawnSync(
  "npx",
  ["prisma", "db", "execute", "--file", resolvedFile],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
    env,
  },
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
