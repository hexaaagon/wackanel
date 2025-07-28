import { nanoid } from "@/lib/utils";
import { user } from "./auth";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const setupUser = pgTable(
  "user_setup",
  {
    id: text("id")
      .primaryKey()
      .unique()
      .$defaultFn(() => nanoid(8)),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    lastUpdated: timestamp("last_updated").$defaultFn(() => new Date()),
    isCompleted: boolean("is_completed").default(false),
  },
  (table) => [
    pgPolicy("Users can read/write their own profile", {
      as: "permissive",
      for: "all",
      to: "authenticated",
      using: sql`id = current_user_id()`,
    }),
  ],
);
