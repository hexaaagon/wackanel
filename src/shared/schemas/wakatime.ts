import { z } from "zod";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { wakatimePendingHeartbeats } from "@/lib/db_drizzle/schema/wakatime";

// Create base schemas from drizzle schema
export const insertPendingHeartbeatSchema = createInsertSchema(
  wakatimePendingHeartbeats,
);
export const selectPendingHeartbeatSchema = createSelectSchema(
  wakatimePendingHeartbeats,
);

// WakaTime API heartbeat schema (based on WakaTime API spec)
export const wakatimeHeartbeatSchema = z.object({
  time: z.number().int().positive(),
  entity: z.string().min(1),
  type: z.enum(["file", "domain", "app", "url"]),
  category: z.string().optional(),
  project: z.string().optional(),
  project_root_count: z.number().int().optional(),
  branch: z.string().optional(),
  language: z.string().optional(),
  dependencies: z.string().optional(),
  lines: z.string().optional(),
  line_additions: z.number().int().optional(),
  line_deletions: z.number().int().optional(),
  lineno: z.number().int().optional(),
  cursorpos: z.string().optional(),
  is_write: z.boolean().optional(),
});

// Schema for single heartbeat request
export const singleHeartbeatRequestSchema = wakatimeHeartbeatSchema;

// Schema for array of heartbeats (both single and bulk endpoints)
export const heartbeatsRequestSchema = z.union([
  wakatimeHeartbeatSchema,
  z.array(wakatimeHeartbeatSchema),
]);

// Schema for bulk heartbeats (must be array)
export const bulkHeartbeatsRequestSchema = z.array(wakatimeHeartbeatSchema);

// Summary endpoint query parameters
export const summaryQuerySchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  range: z
    .enum(["last_7_days", "last_30_days", "last_6_months", "last_year"])
    .optional(),
  project: z.string().optional(),
  branches: z.string().optional(),
  timeout: z.number().int().min(1).max(60).optional(),
  writes_only: z.boolean().optional(),
  timezone: z.string().optional(),
});

// Statusbar endpoint query parameters
export const statusbarQuerySchema = z.object({
  timeout: z.number().int().min(1).max(60).optional(),
  timezone: z.string().optional(),
});

// Type exports
export type WakatimeHeartbeat = z.infer<typeof wakatimeHeartbeatSchema>;
export type HeartbeatsRequest = z.infer<typeof heartbeatsRequestSchema>;
export type BulkHeartbeatsRequest = z.infer<typeof bulkHeartbeatsRequestSchema>;
export type SummaryQuery = z.infer<typeof summaryQuerySchema>;
export type StatusbarQuery = z.infer<typeof statusbarQuerySchema>;
export type InsertPendingHeartbeat = z.infer<
  typeof insertPendingHeartbeatSchema
>;
export type SelectPendingHeartbeat = z.infer<
  typeof selectPendingHeartbeatSchema
>;
