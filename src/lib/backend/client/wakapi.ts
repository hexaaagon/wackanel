import { db } from "@/lib/database/drizzle";
import { wakatimeUserInstances } from "@/lib/database/drizzle/schema/wakatime";
import { eq } from "drizzle-orm";
import {
  instanceStatusCache,
  generateCacheKey,
} from "@/lib/backend/cache/wakatime";

export interface WakapiInstance {
  id: string;
  userId: string;
  type: "wakatime" | "wakapi" | "hackatime" | "other";
  apiUrl: string;
  apiKey: string;
  online: boolean;
  lastChecked: number;
}

export class WakapiClient {
  async getInstancesForUser(userId: string): Promise<WakapiInstance[]> {
    const instances = await db
      .select()
      .from(wakatimeUserInstances)
      .where(eq(wakatimeUserInstances.userId, userId));

    return instances.map((instance) => ({
      id: instance.id,
      userId: instance.userId,
      type: instance.type,
      apiUrl: instance.apiUrl,
      apiKey: instance.apiKey,
      online: this.isInstanceOnline(instance.id),
      lastChecked: this.getLastChecked(instance.id),
    }));
  }

  private isInstanceOnline(instanceId: string): boolean {
    const cacheKey = generateCacheKey("instance_status", instanceId);
    const cached = instanceStatusCache.get(cacheKey);
    return cached?.online ?? false;
  }

  private getLastChecked(instanceId: string): number {
    const cacheKey = generateCacheKey("instance_status", instanceId);
    const cached = instanceStatusCache.get(cacheKey);
    return cached?.lastChecked ?? 0;
  }

  async checkInstanceHealth(instance: WakapiInstance): Promise<boolean> {
    const cacheKey = generateCacheKey("instance_status", instance.id);
    const cached = instanceStatusCache.get(cacheKey);

    if (cached && Date.now() - cached.lastChecked < 60000) {
      return cached.online;
    }

    try {
      const response = await fetch(`${instance.apiUrl}/api/v1/users/current`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000),
      });

      const isOnline = response.ok;

      instanceStatusCache.set(cacheKey, {
        online: isOnline,
        lastChecked: Date.now(),
      });

      return isOnline;
    } catch (error) {
      console.error(
        `Error checking instance health for ${instance.id}:`,
        error,
      );

      instanceStatusCache.set(cacheKey, {
        online: false,
        lastChecked: Date.now(),
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return false;
    }
  }

  async sendHeartbeat(
    instance: WakapiInstance,
    heartbeats: unknown[],
  ): Promise<boolean> {
    const isOnline = await this.checkInstanceHealth(instance);
    if (!isOnline) {
      return false;
    }

    try {
      const response = await fetch(
        `${instance.apiUrl}/api/v1/users/current/heartbeats`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${instance.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(heartbeats),
          signal: AbortSignal.timeout(10000),
        },
      );

      const success = response.ok;

      const cacheKey = generateCacheKey("instance_status", instance.id);
      instanceStatusCache.set(cacheKey, {
        online: success,
        lastChecked: Date.now(),
      });

      return success;
    } catch (error) {
      console.error(`Error sending heartbeat to ${instance.id}:`, error);

      const cacheKey = generateCacheKey("instance_status", instance.id);
      instanceStatusCache.set(cacheKey, {
        online: false,
        lastChecked: Date.now(),
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return false;
    }
  }

  async sendHeartbeatToAllInstances(
    userId: string,
    heartbeats: unknown[],
  ): Promise<{
    successful: string[];
    failed: string[];
  }> {
    const instances = await this.getInstancesForUser(userId);
    const results = await Promise.allSettled(
      instances.map((instance) =>
        this.sendHeartbeat(instance, heartbeats).then((success) => ({
          instanceId: instance.id,
          success,
        })),
      ),
    );

    const successful: string[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
      const instanceId = instances[index].id;
      if (result.status === "fulfilled" && result.value.success) {
        successful.push(instanceId);
      } else {
        failed.push(instanceId);
      }
    });

    return { successful, failed };
  }
}

export const wakapiClient = new WakapiClient();
