import { Client } from "pg";

const schemaName = process.argv[2] || "public";
const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const parsed = new URL(rawUrl);

const client = new Client({
  host: parsed.hostname,
  port: Number(parsed.port || 5432),
  user: decodeURIComponent(parsed.username),
  password: decodeURIComponent(parsed.password),
  database: parsed.pathname.replace(/^\//, ""),
  ssl: { rejectUnauthorized: false },
  options: `-c search_path=${schemaName}`,
});

try {
  await client.connect();
  const { rows } = await client.query(
    "select table_name from information_schema.tables where table_schema = current_schema() and table_type = 'BASE TABLE' order by table_name",
  );

  console.log(`schema=${schemaName}`);
  console.log(`remainingTables=${rows.length}`);
  if (rows.length > 0) {
    console.log(rows.map((row) => row.table_name).join(","));
  }
} finally {
  await client.end();
}
