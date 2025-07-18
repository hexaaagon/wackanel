import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/database/drizzle/schema",
  dialect: "postgresql",
  out: "./src/lib/database/drizzle/migrations",
  dbCredentials: {
    url: process.env.POSTGRES_URL,
  },
} satisfies Config;
