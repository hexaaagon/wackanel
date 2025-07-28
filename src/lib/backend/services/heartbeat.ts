import { db } from "@/lib/database/drizzle";
import {
  wakatimeHeartbeats,
  wakatimePendingHeartbeats,
  wakatimeUserInstances,
} from "@/lib/database/drizzle/schema/wakatime";
import { account } from "@/lib/database/drizzle/schema/auth";
import { eq, and, sql } from "drizzle-orm";
import { wakatimeApiClient } from "@/lib/backend/client/wakatime";
import { wakapiClient } from "@/lib/backend/client/wakapi";
import type { WakatimeHeartbeat } from "@/shared/schemas/wakatime";

interface ProcessedHeartbeat {
  id: string;
  userId: string;
  timeSlot: number;
  project?: string;
  language?: string;
  category?: string;
  editor?: string;
  totalSeconds: number;
  heartbeatCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class HeartbeatService {
  async processHeartbeats(
    userId: string,
    heartbeats: WakatimeHeartbeat[],
  ): Promise<{
    success: boolean;
    processed: number;
    queued: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let processed = 0;
    let queued = 0;

    try {
      // Store heartbeats in aggregated format
      const aggregatedHeartbeats = this.aggregateHeartbeats(userId, heartbeats);

      for (const aggregated of aggregatedHeartbeats) {
        try {
          await this.storeAggregatedHeartbeat(aggregated);
          processed++;
        } catch (error) {
          errors.push(
            `Failed to store heartbeat: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }

      // Try to send to external instances in real-time
      // Only queue failed instances to pending
      const instances = await this.getUserInstances(userId);

      if (instances.length > 0) {
        for (const heartbeat of heartbeats) {
          try {
            const failedInstances =
              await this.sendToInstancesWithFailureTracking(
                userId,
                [heartbeat],
                instances,
              );

            // Only queue heartbeats for instances that failed
            if (failedInstances.length > 0) {
              await this.queuePendingHeartbeat(
                userId,
                heartbeat,
                failedInstances,
              );
              queued++;
            }
          } catch (error) {
            errors.push(
              `Failed to process heartbeat for instances: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
          }
        }
      }

      return {
        success: errors.length === 0,
        processed,
        queued,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        processed,
        queued,
        errors: [
          `Service error: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
      };
    }
  }

  /**
   * Send heartbeats to instances and return list of failed instances
   */
  private async sendToInstancesWithFailureTracking(
    userId: string,
    heartbeats: WakatimeHeartbeat[],
    instances: string[],
  ): Promise<string[]> {
    const failedInstances: string[] = [];

    // Convert heartbeats to the format expected by external APIs
    const formattedHeartbeats = heartbeats.map((hb) => ({
      time: hb.time,
      entity: hb.entity,
      type: hb.type,
      category: hb.category || "coding",
      project: hb.project,
      project_root_count: hb.project_root_count,
      branch: hb.branch,
      language: hb.language,
      dependencies: hb.dependencies,
      lines: hb.lines,
      line_additions: hb.line_additions,
      line_deletions: hb.line_deletions,
      lineno: hb.lineno,
      cursorpos: hb.cursorpos,
      is_write: hb.is_write,
    }));

    // Try to send to WakaTime if it's in the instances list
    if (instances.includes("wakatime")) {
      try {
        const success = await wakatimeApiClient.sendHeartbeat(
          userId,
          formattedHeartbeats,
        );
        if (!success) {
          failedInstances.push("wakatime");
        }
      } catch (error) {
        console.error("Failed to send to WakaTime:", error);
        failedInstances.push("wakatime");
      }
    }

    // Try to send to Wakapi instances
    const wakapiInstanceIds = instances.filter((id) => id !== "wakatime");
    if (wakapiInstanceIds.length > 0) {
      try {
        const results = await wakapiClient.sendHeartbeatToAllInstances(
          userId,
          formattedHeartbeats,
        );

        // Add failed Wakapi instances to the failed list
        wakapiInstanceIds.forEach((instanceId) => {
          if (!results.successful.includes(instanceId)) {
            failedInstances.push(instanceId);
          }
        });
      } catch (error) {
        console.error("Failed to send to Wakapi instances:", error);
        failedInstances.push(...wakapiInstanceIds);
      }
    }

    return failedInstances;
  }

  /**
   * Aggregate heartbeats into 5-minute time slots
   */
  private aggregateHeartbeats(
    userId: string,
    heartbeats: WakatimeHeartbeat[],
  ): ProcessedHeartbeat[] {
    const aggregated = new Map<string, ProcessedHeartbeat>();

    for (const heartbeat of heartbeats) {
      // Round to 5-minute intervals (300 seconds)
      const timeSlot = Math.floor(heartbeat.time / 300) * 300;

      // Create key for aggregation
      const key = `${timeSlot}-${heartbeat.project || "unknown"}-${heartbeat.language || "unknown"}-${heartbeat.category || "unknown"}`;

      if (aggregated.has(key)) {
        const existing = aggregated.get(key)!;
        existing.heartbeatCount += 1;
        existing.totalSeconds += this.calculateActiveSeconds(heartbeat);
        existing.updatedAt = new Date();
      } else {
        aggregated.set(key, {
          id: "", // Will be generated by database
          userId,
          timeSlot,
          project: heartbeat.project,
          language: heartbeat.language,
          category: heartbeat.category,
          editor: this.extractEditor(heartbeat),
          totalSeconds: this.calculateActiveSeconds(heartbeat),
          heartbeatCount: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    return Array.from(aggregated.values());
  }

  /**
   * Calculate active seconds for a heartbeat (heuristic approach)
   */
  private calculateActiveSeconds(heartbeat: WakatimeHeartbeat): number {
    // If it's a write operation, assume more active time
    if (heartbeat.is_write) {
      return 15; // 15 seconds for write operations
    }

    // Base active time for regular heartbeats
    return 10; // 10 seconds for read operations
  }

  /**
   * Extract editor information from heartbeat
   */
  private extractEditor(heartbeat: WakatimeHeartbeat): string | undefined {
    // This would typically come from the user agent or be parsed from the entity
    // For now, we'll return undefined as this info isn't always available
    return undefined;
  }

  /**
   * Store aggregated heartbeat in database
   */
  private async storeAggregatedHeartbeat(
    heartbeat: ProcessedHeartbeat,
  ): Promise<void> {
    // Check if we already have data for this time slot
    const existing = await db
      .select()
      .from(wakatimeHeartbeats)
      .where(
        and(
          eq(wakatimeHeartbeats.userId, heartbeat.userId),
          eq(wakatimeHeartbeats.timeSlot, heartbeat.timeSlot),
          eq(wakatimeHeartbeats.project, heartbeat.project || ""),
          eq(wakatimeHeartbeats.language, heartbeat.language || ""),
          eq(wakatimeHeartbeats.category, heartbeat.category || ""),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing record
      await db
        .update(wakatimeHeartbeats)
        .set({
          totalSeconds: sql`${wakatimeHeartbeats.totalSeconds} + ${heartbeat.totalSeconds}`,
          heartbeatCount: sql`${wakatimeHeartbeats.heartbeatCount} + ${heartbeat.heartbeatCount}`,
          updatedAt: heartbeat.updatedAt,
        })
        .where(eq(wakatimeHeartbeats.id, existing[0].id));
    } else {
      // Insert new record
      await db.insert(wakatimeHeartbeats).values({
        userId: heartbeat.userId,
        timeSlot: heartbeat.timeSlot,
        project: heartbeat.project,
        language: heartbeat.language,
        category: heartbeat.category,
        editor: heartbeat.editor,
        totalSeconds: heartbeat.totalSeconds,
        heartbeatCount: heartbeat.heartbeatCount,
        createdAt: heartbeat.createdAt,
        updatedAt: heartbeat.updatedAt,
      });
    }
  }

  /**
   * Get user instances (WakaTime OAuth + custom instances)
   */
  private async getUserInstances(userId: string): Promise<string[]> {
    const instances: string[] = [];

    // Check if user has WakaTime OAuth connection
    const wakatimeAccount = await db
      .select()
      .from(account)
      .where(
        and(eq(account.userId, userId), eq(account.providerId, "wakatime")),
      )
      .limit(1);

    if (wakatimeAccount.length > 0 && wakatimeAccount[0].accessToken) {
      instances.push("wakatime");
    }

    // Get custom instances
    const customInstances = await db
      .select()
      .from(wakatimeUserInstances)
      .where(eq(wakatimeUserInstances.userId, userId));

    instances.push(...customInstances.map((i) => i.id));

    return instances;
  }

  /**
   * Queue heartbeat for pending processing
   */
  private async queuePendingHeartbeat(
    userId: string,
    heartbeat: WakatimeHeartbeat,
    instances: string[],
  ): Promise<void> {
    await db.insert(wakatimePendingHeartbeats).values({
      userId,
      instances,
      entity: heartbeat.entity,
      type: heartbeat.type,
      category: heartbeat.category,
      time: heartbeat.time,
      project: heartbeat.project,
      projectRootCount: heartbeat.project_root_count,
      branch: heartbeat.branch,
      language: heartbeat.language,
      dependencies: Array.isArray(heartbeat.dependencies)
        ? heartbeat.dependencies.join(",")
        : heartbeat.dependencies,
      lines:
        typeof heartbeat.lines === "number"
          ? heartbeat.lines.toString()
          : heartbeat.lines,
      lineAdditions: heartbeat.line_additions,
      lineDeletions: heartbeat.line_deletions,
      lineno: heartbeat.lineno,
      cursorpos:
        typeof heartbeat.cursorpos === "number"
          ? heartbeat.cursorpos.toString()
          : heartbeat.cursorpos,
      isWrite: heartbeat.is_write,
    });
  }

  /**
   * Process pending heartbeats (called by scheduler)
   */
  async processPendingHeartbeats(limit: number = 100): Promise<{
    processed: number;
    users: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let totalProcessed = 0;

    try {
      const pendingHeartbeats = await db
        .select()
        .from(wakatimePendingHeartbeats)
        .limit(limit);

      if (pendingHeartbeats.length === 0) {
        return { processed: 0, users: 0, errors: [] };
      }

      // Group by user
      const userHeartbeats = new Map<string, typeof pendingHeartbeats>();
      pendingHeartbeats.forEach((heartbeat) => {
        if (!userHeartbeats.has(heartbeat.userId)) {
          userHeartbeats.set(heartbeat.userId, []);
        }
        userHeartbeats.get(heartbeat.userId)!.push(heartbeat);
      });

      const processedIds: string[] = [];

      for (const [userId, heartbeats] of userHeartbeats) {
        try {
          const wakatimeHeartbeats = heartbeats.map((h) => ({
            time: h.time,
            entity: h.entity,
            type: h.type,
            category: h.category || "coding",
            project: h.project,
            project_root_count: h.projectRootCount,
            branch: h.branch,
            language: h.language,
            dependencies: h.dependencies,
            lines: h.lines,
            line_additions: h.lineAdditions,
            line_deletions: h.lineDeletions,
            lineno: h.lineno,
            cursorpos: h.cursorpos,
            is_write: h.isWrite,
          }));

          // Send to WakaTime
          const wakatimeSuccess = await wakatimeApiClient.sendHeartbeat(
            userId,
            wakatimeHeartbeats,
          );

          // Send to Wakapi instances
          const wakapiResults = await wakapiClient.sendHeartbeatToAllInstances(
            userId,
            wakatimeHeartbeats,
          );

          // Process each heartbeat to update instances
          for (const heartbeat of heartbeats) {
            const remainingInstances = heartbeat.instances || [];
            const successfulInstances: string[] = [];

            if (wakatimeSuccess) {
              successfulInstances.push("wakatime");
            }

            successfulInstances.push(...wakapiResults.successful);

            const updatedInstances = remainingInstances.filter(
              (instance) => !successfulInstances.includes(instance),
            );

            if (updatedInstances.length === 0) {
              // All instances processed successfully
              processedIds.push(heartbeat.id);
              totalProcessed++;
            } else {
              // Update remaining instances
              await db
                .update(wakatimePendingHeartbeats)
                .set({ instances: updatedInstances })
                .where(eq(wakatimePendingHeartbeats.id, heartbeat.id));
            }
          }
        } catch (error) {
          errors.push(
            `Error processing user ${userId}: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }

      // Remove successfully processed heartbeats
      if (processedIds.length > 0) {
        await db
          .delete(wakatimePendingHeartbeats)
          .where(
            and(
              ...processedIds.map((id) => eq(wakatimePendingHeartbeats.id, id)),
            ),
          );
      }

      return {
        processed: totalProcessed,
        users: userHeartbeats.size,
        errors,
      };
    } catch (error) {
      return {
        processed: totalProcessed,
        users: 0,
        errors: [
          `Service error: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
      };
    }
  }

  /**
   * Get heartbeat statistics for a user
   */
  async getHeartbeatStats(
    userId: string,
    startTime?: number,
    endTime?: number,
  ): Promise<{
    totalSeconds: number;
    heartbeatCount: number;
    projects: Array<{ name: string; seconds: number; percentage: number }>;
    languages: Array<{ name: string; seconds: number; percentage: number }>;
    categories: Array<{ name: string; seconds: number; percentage: number }>;
  }> {
    const now = Math.floor(Date.now() / 1000);
    const start = startTime || now - 86400; // Default to last 24 hours
    const end = endTime || now;

    const startSlot = Math.floor(start / 300) * 300;
    const endSlot = Math.floor(end / 300) * 300;

    const heartbeats = await db
      .select()
      .from(wakatimeHeartbeats)
      .where(
        and(
          eq(wakatimeHeartbeats.userId, userId),
          sql`${wakatimeHeartbeats.timeSlot} >= ${startSlot}`,
          sql`${wakatimeHeartbeats.timeSlot} <= ${endSlot}`,
        ),
      );

    const totalSeconds = heartbeats.reduce(
      (sum, hb) => sum + (hb.totalSeconds || 0),
      0,
    );
    const totalHeartbeats = heartbeats.reduce(
      (sum, hb) => sum + (hb.heartbeatCount || 0),
      0,
    );

    // Aggregate by project
    const projects = new Map<string, number>();
    const languages = new Map<string, number>();
    const categories = new Map<string, number>();

    heartbeats.forEach((hb) => {
      const seconds = hb.totalSeconds || 0;

      if (hb.project) {
        projects.set(hb.project, (projects.get(hb.project) || 0) + seconds);
      }

      if (hb.language) {
        languages.set(hb.language, (languages.get(hb.language) || 0) + seconds);
      }

      if (hb.category) {
        categories.set(
          hb.category,
          (categories.get(hb.category) || 0) + seconds,
        );
      }
    });

    const formatStats = (map: Map<string, number>) =>
      Array.from(map.entries())
        .map(([name, seconds]) => ({
          name,
          seconds,
          percentage:
            totalSeconds > 0 ? Math.round((seconds / totalSeconds) * 100) : 0,
        }))
        .sort((a, b) => b.seconds - a.seconds);

    return {
      totalSeconds,
      heartbeatCount: totalHeartbeats,
      projects: formatStats(projects),
      languages: formatStats(languages),
      categories: formatStats(categories),
    };
  }

  /**
   * Get recent heartbeat activity for dashboard
   */
  async getRecentActivity(
    userId: string,
    hours: number = 24,
  ): Promise<
    Array<{
      timeSlot: number;
      totalSeconds: number;
      projects: Array<{ name: string; seconds: number }>;
    }>
  > {
    const now = Math.floor(Date.now() / 1000);
    const start = now - hours * 3600;
    const startSlot = Math.floor(start / 300) * 300;
    const endSlot = Math.floor(now / 300) * 300;

    const heartbeats = await db
      .select()
      .from(wakatimeHeartbeats)
      .where(
        and(
          eq(wakatimeHeartbeats.userId, userId),
          sql`${wakatimeHeartbeats.timeSlot} >= ${startSlot}`,
          sql`${wakatimeHeartbeats.timeSlot} <= ${endSlot}`,
        ),
      )
      .orderBy(wakatimeHeartbeats.timeSlot);

    // Group by time slot
    const timeSlots = new Map<
      number,
      { totalSeconds: number; projects: Map<string, number> }
    >();

    heartbeats.forEach((hb) => {
      if (!timeSlots.has(hb.timeSlot)) {
        timeSlots.set(hb.timeSlot, { totalSeconds: 0, projects: new Map() });
      }

      const slot = timeSlots.get(hb.timeSlot)!;
      slot.totalSeconds += hb.totalSeconds || 0;

      if (hb.project) {
        slot.projects.set(
          hb.project,
          (slot.projects.get(hb.project) || 0) + (hb.totalSeconds || 0),
        );
      }
    });

    return Array.from(timeSlots.entries()).map(([timeSlot, data]) => ({
      timeSlot,
      totalSeconds: data.totalSeconds,
      projects: Array.from(data.projects.entries())
        .map(([name, seconds]) => ({ name, seconds }))
        .sort((a, b) => b.seconds - a.seconds),
    }));
  }
}

export const heartbeatService = new HeartbeatService();
