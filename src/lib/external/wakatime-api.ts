import { db } from "@/lib/db_drizzle";
import { wakatimeProfiles } from "@/lib/db_drizzle/schema/wakatime";
import { eq } from "drizzle-orm";
import {
  wakatimeApiCache,
  oauthTokenCache,
  generateCacheKey,
} from "@/lib/cache/wakatime";

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

    // Get fresh token from database
    const profile = await db
      .select()
      .from(wakatimeProfiles)
      .where(eq(wakatimeProfiles.id, userId))
      .limit(1);

    if (!profile.length) {
      return null;
    }

    // In a real implementation, you'd get the OAuth token from the account table
    // For now, we'll simulate this - you'll need to implement OAuth token storage
    // TODO: Implement proper OAuth token retrieval and refresh

    return null; // Placeholder - implement OAuth token management
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

  async sendHeartbeat(userId: string, heartbeats: unknown[]): Promise<boolean> {
    const accessToken = await this.getAccessToken(userId);
    if (!accessToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/users/current/heartbeats`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(heartbeats),
      });

      return response.ok;
    } catch (error) {
      console.error("Error sending heartbeat to WakaTime:", error);
      return false;
    }
  }
}

export const wakatimeApiClient = new WakatimeApiClient();
