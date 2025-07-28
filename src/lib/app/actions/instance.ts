"use server";

import { getInstanceStatus } from "@/lib/app/site/instance/status";
import { getAuth } from "@/lib/auth/server";
import { db } from "@/lib/database/drizzle";
import { wakatimeUserInstances } from "@/lib/database/drizzle/schema/wakatime";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function getInstanceStatusAction() {
  try {
    const session = await getAuth();

    if (!session?.user?.id) {
      return {
        onlineCount: 0,
        offlineCount: 0,
        totalCount: 0,
      };
    }

    return await getInstanceStatus(session.user.id);
  } catch (error) {
    console.error("Error in getInstanceStatusAction:", error);
    return {
      onlineCount: 0,
      offlineCount: 0,
      totalCount: 0,
    };
  }
}

export interface WakapiInstanceData {
  id: string;
  name: string;
  url: string;
  apiKey: string;
  status: "connected" | "connecting" | "error";
}

export async function saveWakapiInstances(instances: WakapiInstanceData[]) {
  try {
    const session = await getAuth();

    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    console.log("💾 Saving instances for user:", session.user.id);
    console.log("📦 Instances to save:", instances);

    // First, delete all existing instances for this user
    const deleteResult = await db
      .delete(wakatimeUserInstances)
      .where(eq(wakatimeUserInstances.userId, session.user.id));

    console.log("🗑️ Deleted existing instances:", deleteResult);

    // Only save instances that are successfully connected
    const connectedInstances = instances.filter(
      (instance) => instance.status === "connected",
    );

    console.log("✅ Connected instances to save:", connectedInstances);

    if (connectedInstances.length === 0) {
      console.log("⚠️ No connected instances to save");
      return { success: true, count: 0 };
    }

    // Insert new instances
    const instancesData = connectedInstances.map((instance) => ({
      id: nanoid(),
      userId: session.user.id,
      type: "wakapi" as const,
      apiUrl: instance.url,
      apiKey: instance.apiKey,
      options: {},
    }));

    console.log("📝 Inserting instances data:", instancesData);

    const insertResult = await db
      .insert(wakatimeUserInstances)
      .values(instancesData);
    console.log("✅ Insert result:", insertResult);

    // Perform health checks for the newly saved instances
    const { wakapiClient } = await import("@/lib/backend/client/wakapi");
    const savedInstances = await wakapiClient.getInstancesForUser(
      session.user.id,
    );

    console.log(
      "🏥 Starting health checks for instances:",
      savedInstances.length,
    );

    // Check health for each instance to populate the cache
    await Promise.allSettled(
      savedInstances.map(async (instance) => {
        try {
          console.log(`🔍 Checking health for instance ${instance.id}`);
          const health = await wakapiClient.checkInstanceHealth(instance);
          console.log(`✅ Health check result for ${instance.id}:`, health);
        } catch (error) {
          console.error(
            `❌ Failed to check health for instance ${instance.id}:`,
            error,
          );
        }
      }),
    );

    console.log("✅ Save completed successfully");
    return { success: true, count: connectedInstances.length };
  } catch (error) {
    console.error("❌ Error saving Wakapi instances:", error);
    throw new Error("Failed to save instances");
  }
}

export async function refreshInstanceStatuses() {
  try {
    const session = await getAuth();

    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const { wakapiClient } = await import("@/lib/backend/client/wakapi");
    const instances = await wakapiClient.getInstancesForUser(session.user.id);

    // Check health for each instance to refresh the cache
    await Promise.allSettled(
      instances.map(async (instance) => {
        try {
          await wakapiClient.checkInstanceHealth(instance);
        } catch (error) {
          console.error(
            `Failed to check health for instance ${instance.id}:`,
            error,
          );
        }
      }),
    );

    return await getInstanceStatus(session.user.id);
  } catch (error) {
    console.error("Error refreshing instance statuses:", error);
    throw new Error("Failed to refresh instance statuses");
  }
}

export async function getUserInstances(): Promise<WakapiInstanceData[]> {
  try {
    const session = await getAuth();

    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const { wakapiClient } = await import("@/lib/backend/client/wakapi");
    const instances = await wakapiClient.getInstancesForUser(session.user.id);

    // Since these instances are already in the database, they should be treated as connected
    // We don't need to check their online status for the setup page
    return instances.map((instance, index) => ({
      id: instance.id,
      name: `Instance ${index + 1}`,
      url: instance.apiUrl,
      apiKey: instance.apiKey,
      status: "connected" as const, // Always show existing instances as connected
    }));
  } catch (error) {
    console.error("Error getting user instances:", error);
    return [];
  }
}
