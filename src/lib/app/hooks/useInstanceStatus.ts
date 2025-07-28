"use client";

import { useState, useEffect } from "react";
import { getInstanceStatusAction } from "@/lib/app/actions/instance";

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

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getInstanceStatusAction();
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
    fetchStatus();
  }, []);

  return {
    status,
    isLoading,
    error,
    refetch: fetchStatus,
  };
}
