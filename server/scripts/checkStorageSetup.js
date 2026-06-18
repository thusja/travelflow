import { Client } from "pg";

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

  const bucketRows = await client.query(
    `select id, public
     from storage.buckets
     where id in ('profile-images', 'review-images')
     order by id`,
  );

  const policyRows = await client.query(
    `select policyname
     from pg_policies
     where schemaname = 'storage'
       and tablename = 'objects'
       and policyname in (
         'profile_images_select_own',
         'profile_images_insert_own',
         'profile_images_update_own',
         'profile_images_delete_own',
         'review_images_select_public',
         'review_images_insert_own',
         'review_images_update_own',
         'review_images_delete_own'
       )
     order by policyname`,
  );

  console.log(`bucketCount=${bucketRows.rows.length}`);
  console.log(
    `buckets=${bucketRows.rows.map((row) => `${row.id}:${row.public}`).join(",")}`,
  );
  console.log(`policyCount=${policyRows.rows.length}`);
  console.log(
    `policies=${policyRows.rows.map((row) => row.policyname).join(",")}`,
  );
} finally {
  await client.end();
}
