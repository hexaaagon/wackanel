import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const wakatimeProfiles = pgTable("wakatime_profiles", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .unique()
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
});
