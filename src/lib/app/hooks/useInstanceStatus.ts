"use client";

import { useState, useEffect } from "react";
import {
  getInstanceStatusAction,
  refreshInstanceStatuses,
} from "@/lib/app/actions/instance";

export interface InstanceStatus {
  onlineCount: number;
  offlineCount: number;
  totalCount: number;
}

export function useInstanceStatus() {
  const [status, setStatus] = useState<InstanceStatus>({
    onlineCount: 0,
    offlineCount: 0,
    totalCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async (shouldRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      let result;
      if (shouldRefresh) {
        // This will check instance health and update cache
        result = await refreshInstanceStatuses();
      } else {
        // This will just get cached status
        result = await getInstanceStatusAction();
      }

      setStatus(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch instance status",
      );
      console.error("Error fetching instance status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch with refresh to populate cache
    fetchStatus(true);

    // Set up periodic refresh every 2 minutes
    const interval = setInterval(
      () => {
        fetchStatus(true);
      },
      2 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, []);

  return {
    status,
    isLoading,
    error,
    refetch: (shouldRefresh = true) => fetchStatus(shouldRefresh),
  };
}
