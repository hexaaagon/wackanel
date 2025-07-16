// Example usage of the WakaTime API with Zod validation

import {
  wakatimeHeartbeatSchema,
  bulkHeartbeatsRequestSchema,
} from "@/shared/schemas/wakatime";

// Example of a valid heartbeat
const validHeartbeat = {
  time: 1642419600,
  entity: "/path/to/file.ts",
  type: "file" as const,
  category: "coding",
  project: "my-project",
  language: "TypeScript",
  is_write: true,
};

// Example of an invalid heartbeat (missing required fields)
const invalidHeartbeat = {
  entity: "/path/to/file.ts",
  // Missing time and type fields
};

// Example of bulk heartbeats
const bulkHeartbeats = [
  {
    time: 1642419600,
    entity: "/path/to/file1.ts",
    type: "file" as const,
    language: "TypeScript",
  },
  {
    time: 1642419660,
    entity: "/path/to/file2.js",
    type: "file" as const,
    language: "JavaScript",
  },
];

// Validation examples
console.log("=== Single Heartbeat Validation ===");

// Valid heartbeat
const validResult = wakatimeHeartbeatSchema.safeParse(validHeartbeat);
console.log("Valid heartbeat:", validResult.success ? "✅ PASS" : "❌ FAIL");

// Invalid heartbeat
const invalidResult = wakatimeHeartbeatSchema.safeParse(invalidHeartbeat);
console.log(
  "Invalid heartbeat:",
  !invalidResult.success ? "✅ PASS" : "❌ FAIL",
);
if (!invalidResult.success) {
  console.log("Validation errors:", invalidResult.error.issues);
}

console.log("\n=== Bulk Heartbeats Validation ===");

// Valid bulk heartbeats
const validBulkResult = bulkHeartbeatsRequestSchema.safeParse(bulkHeartbeats);
console.log(
  "Valid bulk heartbeats:",
  validBulkResult.success ? "✅ PASS" : "❌ FAIL",
);

// Invalid bulk heartbeats (not an array)
const invalidBulkResult = bulkHeartbeatsRequestSchema.safeParse(validHeartbeat);
console.log(
  "Invalid bulk heartbeats:",
  !invalidBulkResult.success ? "✅ PASS" : "❌ FAIL",
);

export {};
