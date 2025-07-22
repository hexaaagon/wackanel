import { nanoid } from "@/lib/utils";
import { user } from "./auth";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  pgPolicy,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const editorApiKey = pgTable(
  "editor_apikey",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid(12)),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    prefix: text("prefix").default("editor_"),
    key: text("key").notNull().unique(),

    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    lastRequestAt: timestamp("last_request_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    pgPolicy("Users can read/write their own API keys", {
      as: "permissive",
      for: "all",
      to: "authenticated",
      using: sql`user_id = current_user_id()`,
    }),
  ],
);
