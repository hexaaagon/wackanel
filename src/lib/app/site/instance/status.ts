import { WakapiClient } from "@/lib/backend/client/wakapi";

export interface InstanceStatus {
  onlineCount: number;
  offlineCount: number;
  totalCount: number;
}

export async function getInstanceStatus(
  userId: string,
): Promise<InstanceStatus> {
  const wakapiClient = new WakapiClient();

  try {
    const instances = await wakapiClient.getInstancesForUser(userId);

    let onlineCount = 0;
    let offlineCount = 0;

    // Use cached status instead of checking health (much faster)
    for (const instance of instances) {
      if (instance.online) {
        onlineCount++;
      } else {
        offlineCount++;
      }
    }

    return {
      onlineCount,
      offlineCount,
      totalCount: instances.length,
    };
  } catch (error) {
    console.error("Error fetching instance status:", error);
    return {
      onlineCount: 0,
      offlineCount: 0,
      totalCount: 0,
    };
  }
}
