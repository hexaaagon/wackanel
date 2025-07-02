import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as auth from "./schema/auth";
import * as wakatime from "./schema/wakatime";

export const client = postgres(process.env.POSTGRES_URL, { prepare: false });
export const db = drizzle(client, {
  schema: {
    ...auth,
    ...wakatime,
  },
});
