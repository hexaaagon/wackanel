import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db/schema",
  dialect: "postgresql",
  out: "./src/lib/db/migrations",
  dbCredentials: {
    url: process.env.POSTGRES_URL,
  },
} satisfies Config;
