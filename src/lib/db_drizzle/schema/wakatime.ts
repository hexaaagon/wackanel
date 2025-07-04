import { nanoid } from "@/lib/utils";
import { user } from "./auth";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  AnyPgColumn,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const wakatimeProfiles = pgTable(
  "user_wakatime_profiles",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    wakatimeId: text("wakatime_id").notNull().unique(),

    // Basic profile info
    username: text("username"),
    displayName: text("display_name"),
    fullName: text("full_name"),
    bio: text("bio"),
    website: text("website"),
    humanReadableWebsite: text("human_readable_website"),

    // Profile image and visibility
    photo: text("photo"),
    photoPublic: boolean("photo_public").default(false),

    // Email settings
    publicEmail: text("public_email"),
    isEmailPublic: boolean("is_email_public").default(false),
    isEmailConfirmed: boolean("is_email_confirmed").default(false),

    // Location
    timezone: text("timezone"),
    cityName: text("city_name"),
    cityState: text("city_state"),
    cityCountryCode: text("city_country_code"),
    cityTitle: text("city_title"),

    // Privacy settings
    loggedTimePublic: boolean("logged_time_public").default(false),
    languagesUsedPublic: boolean("languages_used_public").default(false),
    editorsUsedPublic: boolean("editors_used_public").default(false),
    categoriesUsedPublic: boolean("categories_used_public").default(false),
    osUsedPublic: boolean("os_used_public").default(false),

    // Recent activity
    lastHeartbeatAt: timestamp("last_heartbeat_at"),
    lastPlugin: text("last_plugin"),
    lastPluginName: text("last_plugin_name"),
    lastProject: text("last_project"),
    lastBranch: text("last_branch"),

    // Account info
    plan: text("plan"),
    hasPremiumFeatures: boolean("has_premium_features").default(false),
    isHireable: boolean("is_hireable").default(false),

    // Social profiles
    githubUsername: text("github_username"),
    twitterUsername: text("twitter_username"),
    linkedinUsername: text("linkedin_username"),
    wonderfuldevUsername: text("wonderfuldev_username"),

    // Timestamps
    wakatimeCreatedAt: timestamp("wakatime_created_at"),
    wakatimeModifiedAt: timestamp("wakatime_modified_at"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
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

export const wakatimeUserStats = pgTable(
  "user_wakatime_stats",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Activity time fields
    totalSeconds: integer("total_seconds").notNull(),
    totalSecondsIncludingOther: integer(
      "total_seconds_including_other_language",
    ).notNull(),
    humanReadableTotal: text("human_readable_total").notNull(),
    humanReadableTotalIncludingOther: text(
      "human_readable_total_including_other_language",
    ).notNull(),

    // Best hour (instead of best day)
    bestHour: integer("best_hour"), // 0-23
    bestHourTotalSeconds: integer("best_hour_total_seconds"),
    bestHourText: text("best_hour_text"),

    // JSON fields for aggregated data (easier to query and update)
    categories: text("categories"), // JSON array of {name, total_seconds, percent, text}
    projects: text("projects"), // JSON array of {name, total_seconds, percent, text}
    languages: text("languages"), // JSON array of {name, total_seconds, percent, text}
    editors: text("editors"), // JSON array of {name, total_seconds, percent, text}

    // Timestamps
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    pgPolicy("Users can read their own stats", {
      as: "permissive",
      for: "select",
      to: "authenticated",
      using: sql`id = current_user_id()`,
    }),
  ],
);

export const wakatimeUserInstances = pgTable(
  "user_wakatime_instances",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Instance data
    type: text("type")
      .$type<"wakatime" | "wakapi" | "hackatime" | "other">()
      .notNull(),
    // customApiPath: text("custom_api_path").references(
    //   () => wakatimeUserInstanceCustomApiPaths.id,
    //   { onDelete: "cascade" },
    // ),
    apiUrl: text("api_url").notNull(),
  },
  (table) => [
    pgPolicy("Users can read/write their own", {
      as: "permissive",
      for: "all",
      to: "authenticated",
      using: sql`user_id = current_user_id()`,
    }),
  ],
);

// Coming soon! it's too hard to implement this right now
// export const wakatimeUserInstanceCustomApiPaths = pgTable(
//   "user_wakatime_instance_custom_api_paths",
//   {
//     id: text("id")
//       .primaryKey()
//       .notNull()
//       .$defaultFn(() => nanoid()),
//     instanceId: text("instance_id")
//       .notNull()
//       .references((): AnyPgColumn => wakatimeUserInstances.id, {
//         onDelete: "cascade",
//       }),
//     userId: text("user_id")
//       .notNull()
//       .references(() => user.id, { onDelete: "cascade" }),
//
//     // paths
//     heartbeat: text("heartbeat").notNull(),
//   },
// );

export const wakatimeHeartbeats = pgTable(
  "user_wakatime_heartbeats",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Time aggregation - rounded to 5-minute intervals
    timeSlot: integer("time_slot").notNull(), // unix timestamp rounded to 5min intervals

    // Activity data
    project: text("project"),
    language: text("language"),
    category: text("category"),
    editor: text("editor"),

    // Aggregated metrics for this time slot
    totalSeconds: integer("total_seconds").notNull().default(0), // total active seconds in this slot
    heartbeatCount: integer("heartbeat_count").notNull().default(1), // number of heartbeats aggregated

    // For cleanup and tracking
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    pgPolicy("Users can read/write their own heartbeats", {
      as: "permissive",
      for: "all",
      to: "authenticated",
      using: sql`user_id = current_user_id()`,
    }),
  ],
);

export const wakatimePendingHeartbeats = pgTable(
  "user_wakatime_pending_heartbeats",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Pending Wakatime Instances
    instances: text("instances")
      .array()
      .default(sql`ARRAY[]::text[]`)
      .notNull(),

    // Heartbeat data
    entity: text("entity").notNull(),
    type: text("type").notNull(),
    category: text("category"),
    time: integer("time").notNull(),
    project: text("project"),
    projectRootCount: integer("project_root_count"),
    branch: text("branch"),
    language: text("language"),
    dependencies: text("dependencies"),
    lines: text("lines"), // when entity type is file
    lineAdditions: integer("line_additions"),
    lineDeletions: integer("line_deletions"),
    lineno: integer("lineno"),
    cursorpos: text("cursorpos"),
    isWrite: boolean("is_write"),
  },
  (table) => [
    pgPolicy("Users can read/write their own pending heartbeat", {
      as: "permissive",
      for: "all",
      to: "authenticated",
      using: sql`user_id = current_user_id()`,
    }),
  ],
);
