import { GenericOAuthConfig } from "better-auth/plugins";
import { db } from "@/lib/database/drizzle";
import { wakatimeProfiles } from "@/lib/database/drizzle/schema/wakatime";
import { User } from "@/shared/types/oauth/wakatime";

export const config: GenericOAuthConfig = {
  providerId: "wakatime",

  clientId: process.env.BETTER_AUTH_WAKATIME_CLIENT_ID,
  clientSecret: process.env.BETTER_AUTH_WAKATIME_CLIENT_SECRET,

  authorizationUrl: "https://wakatime.com/oauth/authorize",
  tokenUrl: "https://wakatime.com/oauth/token",

  scopes: ["email", "read_heartbeats", "write_heartbeats", "read_stats"],

  getUserInfo: async (tokens) => {
    const response = await fetch("https://wakatime.com/api/v1/users/current", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user info from WakaTime");
    }

    const data = await response.json();
    const wakatimeUser = data.data;

    return {
      id: wakatimeUser.id,
      email: wakatimeUser.email,
      emailVerified: wakatimeUser.is_email_confirmed,
      name: wakatimeUser.display_name,
      image: wakatimeUser.photo,
      createdAt: new Date(wakatimeUser.created_at),
      updatedAt: new Date(wakatimeUser.modified_at),
    };
  },
};

export async function upsertWakatimeProfile(
  wakatimeData: User,
  userId: string,
) {
  try {
    await db
      .insert(wakatimeProfiles)
      .values({
        id: userId, // Reference to the local user
        wakatimeId: wakatimeData.id, // Store the WakaTime user ID

        // Basic profile info
        username: wakatimeData.username,
        displayName: wakatimeData.display_name,
        fullName: wakatimeData.full_name,
        bio: wakatimeData.bio,
        website: wakatimeData.website,
        humanReadableWebsite: wakatimeData.human_readable_website,

        // Profile image and visibility
        photo: wakatimeData.photo,
        photoPublic: wakatimeData.photo_public || false,

        // Email settings
        publicEmail: wakatimeData.public_email,
        isEmailPublic: wakatimeData.is_email_public || false,
        isEmailConfirmed: wakatimeData.is_email_confirmed || false,

        // Location
        timezone: wakatimeData.timezone,
        cityName: wakatimeData.city?.name,
        cityState: wakatimeData.city?.state,
        cityCountryCode: wakatimeData.city?.country_code,
        cityTitle: wakatimeData.city?.title,

        // Privacy settings
        loggedTimePublic: wakatimeData.logged_time_public || false,
        languagesUsedPublic: wakatimeData.languages_used_public || false,
        editorsUsedPublic: wakatimeData.editors_used_public || false,
        categoriesUsedPublic: wakatimeData.categories_used_public || false,
        osUsedPublic: wakatimeData.os_used_public || false,

        // Recent activity
        lastHeartbeatAt: wakatimeData.last_heartbeat_at
          ? new Date(wakatimeData.last_heartbeat_at)
          : null,
        lastPlugin: wakatimeData.last_plugin,
        lastPluginName: wakatimeData.last_plugin_name,
        lastProject: wakatimeData.last_project,
        lastBranch: wakatimeData.last_branch,

        // Account info
        plan: wakatimeData.plan,
        hasPremiumFeatures: wakatimeData.has_premium_features || false,
        isHireable: wakatimeData.is_hireable || false,

        // Social profiles
        githubUsername: wakatimeData.github_username,
        twitterUsername: wakatimeData.twitter_username,
        linkedinUsername: wakatimeData.linkedin_username,
        wonderfuldevUsername: wakatimeData.wonderfuldev_username,

        // Timestamps
        wakatimeCreatedAt: wakatimeData.created_at
          ? new Date(wakatimeData.created_at)
          : null,
        wakatimeModifiedAt: wakatimeData.modified_at
          ? new Date(wakatimeData.modified_at)
          : null,
      })
      .onConflictDoUpdate({
        target: wakatimeProfiles.id, // Use id as the conflict target
        set: {
          // Update all fields except id and wakatimeId
          username: wakatimeData.username,
          displayName: wakatimeData.display_name,
          fullName: wakatimeData.full_name,
          bio: wakatimeData.bio,
          website: wakatimeData.website,
          humanReadableWebsite: wakatimeData.human_readable_website,
          photo: wakatimeData.photo,
          photoPublic: wakatimeData.photo_public || false,
          publicEmail: wakatimeData.public_email,
          isEmailPublic: wakatimeData.is_email_public || false,
          isEmailConfirmed: wakatimeData.is_email_confirmed || false,
          timezone: wakatimeData.timezone,
          cityName: wakatimeData.city?.name,
          cityState: wakatimeData.city?.state,
          cityCountryCode: wakatimeData.city?.country_code,
          cityTitle: wakatimeData.city?.title,
          loggedTimePublic: wakatimeData.logged_time_public || false,
          languagesUsedPublic: wakatimeData.languages_used_public || false,
          editorsUsedPublic: wakatimeData.editors_used_public || false,
          categoriesUsedPublic: wakatimeData.categories_used_public || false,
          osUsedPublic: wakatimeData.os_used_public || false,
          lastHeartbeatAt: wakatimeData.last_heartbeat_at
            ? new Date(wakatimeData.last_heartbeat_at)
            : null,
          lastPlugin: wakatimeData.last_plugin,
          lastPluginName: wakatimeData.last_plugin_name,
          lastProject: wakatimeData.last_project,
          lastBranch: wakatimeData.last_branch,
          plan: wakatimeData.plan,
          hasPremiumFeatures: wakatimeData.has_premium_features || false,
          isHireable: wakatimeData.is_hireable || false,
          githubUsername: wakatimeData.github_username,
          twitterUsername: wakatimeData.twitter_username,
          linkedinUsername: wakatimeData.linkedin_username,
          wonderfuldevUsername: wakatimeData.wonderfuldev_username,
          wakatimeCreatedAt: wakatimeData.created_at
            ? new Date(wakatimeData.created_at)
            : null,
          wakatimeModifiedAt: wakatimeData.modified_at
            ? new Date(wakatimeData.modified_at)
            : null,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error("Error upserting WakaTime profile:", error);
    throw error;
  }
}
