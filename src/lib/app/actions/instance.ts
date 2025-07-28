"use server";

import { getInstanceStatus } from "@/lib/app/site/instance/status";
import { getAuth } from "@/lib/auth/server";

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
