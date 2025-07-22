import { betterAuth, Account } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/lib/database/drizzle";
import * as schema from "@/lib/database/drizzle/schema/auth";

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
  session: {
    cookieName: "better-auth.session_token",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  databaseHooks: {
    account: {
      create: {
        after: async (account) => {
          if (account.providerId === "wakatime")
            return await upsertWakatime(account);
        },
      },
      update: {
        after: async (account) => {
          if (account.providerId === "wakatime" && account.accessToken)
            return await upsertWakatime(account);
        },
      },
    },
  },
  plugins: [
    genericOAuth({
      config: [wakatimeConfig],
    }),
    nextCookies(),
  ],
});

const upsertWakatime = async (account: Account) => {
  try {
    const response = await fetch("https://wakatime.com/api/v1/users/current", {
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch WakaTime user data after account update");
      return;
    }

    const data = await response.json();
    const wakatimeUser = data.data;

    await upsertWakatimeProfile(wakatimeUser, account.userId);
    return;
  } catch (error) {
    console.error("Error in WakaTime account update hook:", error);
    return;
  }
};
