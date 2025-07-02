import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db_drizzle/schema",
  dialect: "postgresql",
  out: "./src/lib/db_drizzle/migrations",
  dbCredentials: {
    url: process.env.POSTGRES_URL,
  },
} satisfies Config;
