import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema/auth";

import { genericOAuth } from "better-auth/plugins";
import {
  config as wakatimeConfig,
  upsertWakatimeProfile,
} from "@/lib/auth/oauth/wakatime";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  databaseHooks: {
    account: {
      create: {
        after: async (account) => {
          if (account.providerId === "wakatime") {
            try {
              const response = await fetch(
                "https://wakatime.com/api/v1/users/current",
                {
                  headers: {
                    Authorization: `Bearer ${account.accessToken}`,
                  },
                },
              );

              if (!response.ok) {
                console.error("Failed to fetch WakaTime user data after OAuth");
                return;
              }

              const data = await response.json();
              const wakatimeUser = data.data;

              await upsertWakatimeProfile(wakatimeUser, account.userId);
            } catch (error) {
              console.error("Error in WakaTime account creation hook:", error);
            }
          }
        },
      },
      update: {
        after: async (account) => {
          if (account.providerId === "wakatime" && account.accessToken) {
            try {
              const response = await fetch(
                "https://wakatime.com/api/v1/users/current",
                {
                  headers: {
                    Authorization: `Bearer ${account.accessToken}`,
                  },
                },
              );

              if (!response.ok) {
                console.error(
                  "Failed to fetch WakaTime user data after account update",
                );
                return;
              }

              const data = await response.json();
              const wakatimeUser = data.data;

              await upsertWakatimeProfile(wakatimeUser, account.userId);
            } catch (error) {
              console.error("Error in WakaTime account update hook:", error);
            }
          }
        },
      },
    },
  },
  plugins: [
    nextCookies(),
    genericOAuth({
      config: [wakatimeConfig],
    }),
  ],
});
