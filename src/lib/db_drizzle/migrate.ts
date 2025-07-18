import { type PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import type { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Database = any;
import postgres from "postgres";

import { createServiceServer } from "@/lib/db_supabase/service-server";

import path from "node:path";
import { glob } from "glob";
import fs from "fs-extra";
import { absoluteUrl } from "../utils";

const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL is not defined");
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });

  const db = drizzle(connection);

  const start = Date.now();

  console.log("⏳ Running SQL hooks before migration...");
  await RunSQLHooks("before", db);

  // Database Migration
  console.log("⏳ Running Database migrations...");
  await migrate(db, { migrationsFolder: "src/lib/db_drizzle/migrations" });

  // Supabase Extensions check
  console.log("⏳ Checking Supabase Extensions...");
  const supabase = createServiceServer();
  const isExtensionsEnabled = await checkExtensions(db, supabase);
  if (!isExtensionsEnabled) {
    const end = Date.now();
    console.log("❌ Migrations completed in", end - start, "ms with errors.");
    return process.exit(1);
  }
  // Run SQL hooks after migration
  console.log("⏳ Running SQL hooks after migration...");
  await RunSQLHooks("after", db);

  // Enable Supabase Cron Jobs
  console.log("⏳ Enabling Supabase Cron Jobs...");
  await EnableSupabaseCron(db, supabase);

  const end = Date.now();
  console.log("✅ Migrations completed in", end - start, "ms");

  process.exit(0);
};

async function checkExtensions(
  db: PostgresJsDatabase,
  supabase: SupabaseClient<Database>,
) {
  const checkPgNetQuery =
    "SELECT * FROM pg_available_extensions WHERE name = 'pg_net' AND installed_version IS NOT NULL";
  const checkCronQuery =
    "SELECT * FROM pg_available_extensions WHERE name = 'pg_cron' AND installed_version IS NOT NULL";

  const pgNetResult = await db.execute(checkPgNetQuery);
  const cronResult = await db.execute(checkCronQuery);

  const isPgNetEnabled = pgNetResult.length > 0;
  const isPgCronEnabled = cronResult.length > 0;

  console.log(
    isPgNetEnabled
      ? "  ✅ 'pg_net' extension installed."
      : "  ⚠️  WARNING : 'pg_net' extension not found. Please install the extension first. (https://supabase.com/dashboard/project/_/database/extensions)",
  );
  console.log(
    isPgCronEnabled
      ? "  ✅ 'pg_cron' extension installed."
      : "  ⚠️  WARNING : 'pg_cron' extension not found. Please install the extension first. (https://supabase.com/dashboard/project/_/integrations/cron/overview)",
  );

  return isPgNetEnabled && isPgCronEnabled;
}

async function EnableSupabaseCron(
  db: PostgresJsDatabase,
  supabase: SupabaseClient<Database>,
) {
  const files = (await glob(`src/lib/db_drizzle/sql/crons/*.sql`)).map(
    (filePath) => path.resolve(filePath),
  );

  const file: boolean[] = await Promise.all(
    files.map(async (file) => {
      let script = await fs.readFile(file, "utf8");

      if (!script) return false;

      script = script
        .replaceAll("{{APP_URL}}", absoluteUrl().slice(0, -1))
        .replaceAll(
          "{{APP_PASSWORD}}",
          `Bearer ${process.env.POSTGRES_PASSWORD}`,
        );

      const args = (file.startsWith("/") ? file.replace("/", "") : file).split(
        "/",
      );

      try {
        await new Promise((res) =>
          setTimeout(() => res(null), Math.floor(Math.random() * 5 * 1000)),
        );
        await db.execute(script);
      } catch (e) {
        console.error(`Error while enabling ${args.slice(-1)}:`, e);
        console.error(`Script content:`, script);
        return false;
      }

      return true;
    }),
  );

  const total = file.length;
  const success = file.filter((v) => v === true);
  const failed = file.filter((v) => v === false);

  console.log(`  ✅ ${success.length}/${total} crons enabled`);
  console.log(`  ❌ ${failed.length}/${total} crons failed`);
  return;
}

const templateReplacements: Array<
  [
    string,
    (
      | string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      | ((type: "before" | "after", ...args: any) => string | Promise<string>)
    ),
  ]
> = [
  ["APP_URL", absoluteUrl().slice(0, -1)],
  ["HOOK_TYPE", (type: "before" | "after") => type],
];
async function RunSQLHooks(type: "before" | "after", db: PostgresJsDatabase) {
  const files = (await glob(`src/lib/db_drizzle/sql/hooks/${type}/*.sql`)).map(
    (filePath) => path.resolve(filePath),
  );

  const file: boolean[] = await Promise.all(
    files.map(async (file) => {
      console.log(`  Running ${type} hook: ${file.split("/").pop()}`);
      let script = await fs.readFile(file, "utf8");

      if (!script) return false;

      await Promise.all(
        templateReplacements.map(async ([key, value]) => {
          if (typeof value === "function") {
            script = script.replaceAll(`{{${key}}}`, await value(type));
          } else {
            script = script.replaceAll(`{{${key}}}`, value);
          }
        }),
      );

      try {
        await new Promise((res) =>
          setTimeout(() => res(null), Math.floor(Math.random() * 5 * 1000)),
        );
        await db.execute(script).catch((e) => {
          console.error(e);
          throw e;
        });
      } catch (e) {
        console.log(file, `Error while running ${type} hook: ` + e);

        return false;
      }

      return true;
    }),
  );

  const total = file.length;
  const success = file.filter((v) => v === true);
  const failed = file.filter((v) => v === false);

  console.log(`  ✅ ${success.length}/${total} ${type} hooks ran`);
  console.log(`  ❌ ${failed.length}/${total} ${type} hooks failed`);
  return;
}

runMigrate().catch((err) => {
  console.error("❌ Migration failed");
  console.error(err);
  process.exit(1);
});
