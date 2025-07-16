import { describe, it, expect } from "bun:test";
import {
  wakatimeHeartbeatSchema,
  heartbeatsRequestSchema,
  bulkHeartbeatsRequestSchema,
  summaryQuerySchema,
} from "@/shared/schemas/wakatime";

describe("WakaTime Schemas", () => {
  describe("wakatimeHeartbeatSchema", () => {
    it("should validate a valid heartbeat", () => {
      const validHeartbeat = {
        time: 1642118400,
        entity: "/path/to/file.js",
        type: "file" as const,
        category: "coding",
        project: "my-project",
        language: "javascript",
        is_write: true,
      };

      const result = wakatimeHeartbeatSchema.safeParse(validHeartbeat);
      expect(result.success).toBe(true);
    });

    it("should reject invalid heartbeat with missing required fields", () => {
      const invalidHeartbeat = {
        entity: "/path/to/file.js",
        // missing time and type
      };

      const result = wakatimeHeartbeatSchema.safeParse(invalidHeartbeat);
      expect(result.success).toBe(false);
    });

    it("should reject invalid type", () => {
      const invalidHeartbeat = {
        time: 1642118400,
        entity: "/path/to/file.js",
        type: "invalid_type",
      };

      const result = wakatimeHeartbeatSchema.safeParse(invalidHeartbeat);
      expect(result.success).toBe(false);
    });
  });

  describe("heartbeatsRequestSchema", () => {
    it("should validate single heartbeat", () => {
      const singleHeartbeat = {
        time: 1642118400,
        entity: "/path/to/file.js",
        type: "file" as const,
      };

      const result = heartbeatsRequestSchema.safeParse(singleHeartbeat);
      expect(result.success).toBe(true);
    });

    it("should validate array of heartbeats", () => {
      const heartbeatsArray = [
        {
          time: 1642118400,
          entity: "/path/to/file.js",
          type: "file" as const,
        },
        {
          time: 1642118500,
          entity: "/path/to/another.js",
          type: "file" as const,
        },
      ];

      const result = heartbeatsRequestSchema.safeParse(heartbeatsArray);
      expect(result.success).toBe(true);
    });
  });

  describe("bulkHeartbeatsRequestSchema", () => {
    it("should validate array of heartbeats", () => {
      const heartbeatsArray = [
        {
          time: 1642118400,
          entity: "/path/to/file.js",
          type: "file" as const,
        },
      ];

      const result = bulkHeartbeatsRequestSchema.safeParse(heartbeatsArray);
      expect(result.success).toBe(true);
    });

    it("should reject single heartbeat (must be array)", () => {
      const singleHeartbeat = {
        time: 1642118400,
        entity: "/path/to/file.js",
        type: "file" as const,
      };

      const result = bulkHeartbeatsRequestSchema.safeParse(singleHeartbeat);
      expect(result.success).toBe(false);
    });
  });

  describe("summaryQuerySchema", () => {
    it("should validate valid query parameters", () => {
      const validQuery = {
        range: "last_7_days" as const,
        timeout: 15,
        writes_only: true,
      };

      const result = summaryQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it("should validate with datetime strings", () => {
      const validQuery = {
        start: "2024-01-01T00:00:00Z",
        end: "2024-01-07T23:59:59Z",
      };

      const result = summaryQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it("should reject invalid range", () => {
      const invalidQuery = {
        range: "invalid_range",
      };

      const result = summaryQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it("should reject invalid timeout", () => {
      const invalidQuery = {
        timeout: 100, // max is 60
      };

      const result = summaryQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });
  });
});
