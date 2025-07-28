import { db } from "@/lib/database/drizzle";
import { wakatimeProfiles } from "@/lib/database/drizzle/schema/wakatime";
import { account } from "@/lib/database/drizzle/schema/auth";
import { eq, and } from "drizzle-orm";
import { wakatimeApiCache } from "@/lib/backend/cache/wakatime";
import { oauthTokenCache } from "@/lib/backend/cache/auth";
import { generateCacheKey } from "@/lib/backend/cache/utils";

export interface WakatimeApiResponse<T = unknown> {
  data: T;
  status: "ok" | "error";
  message?: string;
}

export interface WakatimeSummaryData {
  data: Array<{
    grand_total: {
      digital: string;
      hours: number;
      minutes: number;
      text: string;
      total_seconds: number;
    };
    projects: Array<{
      name: string;
      total_seconds: number;
      percent: number;
      digital: string;
      text: string;
      hours: number;
      minutes: number;
    }>;
    languages: Array<{
      name: string;
      total_seconds: number;
      percent: number;
      digital: string;
      text: string;
      hours: number;
      minutes: number;
    }>;
    categories: Array<{
      name: string;
      total_seconds: number;
      percent: number;
      digital: string;
      text: string;
      hours: number;
      minutes: number;
    }>;
    editors: Array<{
      name: string;
      total_seconds: number;
      percent: number;
      digital: string;
      text: string;
      hours: number;
      minutes: number;
    }>;
    range: {
      start: string;
      end: string;
      date: string;
      text: string;
      timezone: string;
    };
  }>;
}

export interface WakatimeStatusbarData {
  data: {
    cached_at: string;
    decimal: string;
    digital: string;
    percent: number;
    text: string;
    timeout: number;
    total_seconds: number;
    project: string | null;
    category: string | null;
    language: string | null;
    is_coding: boolean;
  };
}

export class WakatimeApiClient {
  private readonly baseUrl = "https://wakatime.com/api/v1";

  private async getAccessToken(userId: string): Promise<string | null> {
    const cacheKey = generateCacheKey("oauth_token", userId);
    const cached = oauthTokenCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.accessToken;
    }

    // Get OAuth token from database
    const accounts = await db
      .select()
      .from(account)
      .where(
        and(eq(account.userId, userId), eq(account.providerId, "wakatime")),
      )
      .limit(1);

    if (!accounts.length || !accounts[0].accessToken) {
      return null;
    }

    const accountData = accounts[0];

    // Check if token is expired and needs refresh
    if (
      accountData.accessTokenExpiresAt &&
      accountData.accessTokenExpiresAt < new Date()
    ) {
      if (accountData.refreshToken) {
        const refreshedToken = await this.refreshAccessToken(
          accountData.refreshToken,
          userId,
        );
        if (refreshedToken) {
          // Cache the new token
          oauthTokenCache.set(cacheKey, {
            accessToken: refreshedToken.accessToken,
            expiresAt: refreshedToken.expiresAt,
          });
          return refreshedToken.accessToken;
        }
      }
      return null;
    }

    // Cache the token
    const expiresAt = accountData.accessTokenExpiresAt
      ? accountData.accessTokenExpiresAt.getTime()
      : Date.now() + 3600 * 1000; // Default 1 hour

    oauthTokenCache.set(cacheKey, {
      accessToken: accountData.accessToken!,
      expiresAt,
    });

    return accountData.accessToken;
  }

  private async refreshAccessToken(
    refreshToken: string,
    userId: string,
  ): Promise<{
    accessToken: string;
    expiresAt: number;
  } | null> {
    try {
      const response = await fetch("https://wakatime.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: process.env.BETTER_AUTH_WAKATIME_CLIENT_ID!,
          client_secret: process.env.BETTER_AUTH_WAKATIME_CLIENT_SECRET!,
        }),
      });

      if (!response.ok) {
        console.error("Failed to refresh WakaTime token:", response.status);
        return null;
      }

      const data = await response.json();

      // Update the account with new tokens
      await db
        .update(account)
        .set({
          accessToken: data.access_token,
          refreshToken: data.refresh_token || refreshToken,
          accessTokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
          updatedAt: new Date(),
        })
        .where(
          and(eq(account.userId, userId), eq(account.providerId, "wakatime")),
        );

      return {
        accessToken: data.access_token,
        expiresAt: Date.now() + data.expires_in * 1000,
      };
    } catch (error) {
      console.error("Error refreshing WakaTime token:", error);
      return null;
    }
  }

  async getSummary(
    userId: string,
    params: {
      start?: string;
      end?: string;
      range?: string;
      project?: string;
      branches?: string;
      timeout?: number;
      writes_only?: boolean;
      timezone?: string;
    },
  ): Promise<WakatimeSummaryData | null> {
    const accessToken = await this.getAccessToken(userId);
    if (!accessToken) {
      return null;
    }

    const cacheKey = generateCacheKey(
      "summary",
      userId,
      JSON.stringify(params),
    );
    const cached = wakatimeApiCache.get(cacheKey);

    if (cached && cached.endpoint === "summary") {
      return cached.data as WakatimeSummaryData;
    }

    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const response = await fetch(
        `${this.baseUrl}/users/current/summaries?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(5000), // 5 second timeout
        },
      );

      if (!response.ok) {
        throw new Error(`WakaTime API error: ${response.status}`);
      }

      const data = (await response.json()) as WakatimeSummaryData;

      wakatimeApiCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        endpoint: "summary",
      });

      return data;
    } catch (error) {
      console.error("Error fetching WakaTime summary:", error);
      return null;
    }
  }

  async getStatusbar(userId: string): Promise<WakatimeStatusbarData | null> {
    const accessToken = await this.getAccessToken(userId);
    if (!accessToken) {
      return null;
    }

    const cacheKey = generateCacheKey("statusbar", userId);
    const cached = wakatimeApiCache.get(cacheKey);

    if (cached && cached.endpoint === "statusbar") {
      return cached.data as WakatimeStatusbarData;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/users/current/status_bar/today`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(5000), // 5 second timeout
        },
      );

      if (!response.ok) {
        throw new Error(`WakaTime API error: ${response.status}`);
      }

      const data = (await response.json()) as WakatimeStatusbarData;

      wakatimeApiCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        endpoint: "statusbar",
      });

      return data;
    } catch (error) {
      console.error("Error fetching WakaTime statusbar:", error);
      return null;
    }
  }

  async hasValidToken(userId: string): Promise<boolean> {
    const token = await this.getAccessToken(userId);
    return token !== null;
  }

  async sendHeartbeat(userId: string, heartbeats: unknown[]): Promise<boolean> {
    const accessToken = await this.getAccessToken(userId);
    if (!accessToken) {
      console.error("No access token available for WakaTime API");
      return false;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/users/current/heartbeats.bulk`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(heartbeats),
          signal: AbortSignal.timeout(10000), // 10 second timeout
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `WakaTime API error: ${response.status} ${response.statusText}`,
          errorText,
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error sending heartbeat to WakaTime:", error);
      return false;
    }
  }
}

export const wakatimeApiClient = new WakatimeApiClient();
