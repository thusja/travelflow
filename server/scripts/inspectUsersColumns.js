import "dotenv/config";
import { Client } from "pg";

const raw = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!raw) {
  console.error("DIRECT_URL or DATABASE_URL is required");
  process.exit(1);
}

const parsed = new URL(raw);

const client = new Client({
  host: parsed.hostname,
  port: Number(parsed.port || 5432),
  user: decodeURIComponent(parsed.username),
  password: decodeURIComponent(parsed.password),
  database: parsed.pathname.replace(/^\//, ""),
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  const result = await client.query(
    "select column_name from information_schema.columns where table_schema = 'public' and table_name = 'users' order by ordinal_position",
  );

  console.log(result.rows.map((row) => row.column_name).join(","));
} finally {
  await client.end();
}
