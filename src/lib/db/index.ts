import { drizzle } from "drizzle-orm/neon-http";
import * as authSchema from "./schema/auth";
import * as wakatimeSchema from "./schema/wakatime";

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: { ...authSchema, ...wakatimeSchema },
});
