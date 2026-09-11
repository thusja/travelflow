import { Client } from "pg";

const schemaName = process.argv[2] || "public";
const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!rawUrl) {
  console.error("DIRECT_URL or DATABASE_URL is required.");
  process.exit(1);
}

const parsed = new URL(rawUrl);

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

  const rlsRows = await client.query(
    `select c.relname as table_name
     from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = $1 and c.relkind = 'r' and c.relrowsecurity = true
     order by c.relname`,
    [schemaName],
  );

  const policyRows = await client.query(
    `select tablename as table_name, policyname as policy_name
     from pg_policies
     where schemaname = $1
     order by tablename, policyname`,
    [schemaName],
  );

  console.log(`schema=${schemaName}`);
  console.log(`rlsEnabledTables=${rlsRows.rows.length}`);
  if (rlsRows.rows.length > 0) {
    console.log(
      `rlsTables=${rlsRows.rows.map((row) => row.table_name).join(",")}`,
    );
  }

  console.log(`policyCount=${policyRows.rows.length}`);
  if (policyRows.rows.length > 0) {
    console.log(
      `policies=${policyRows.rows
        .map((row) => `${row.table_name}.${row.policy_name}`)
        .join(",")}`,
    );
  }
} finally {
  await client.end();
}
