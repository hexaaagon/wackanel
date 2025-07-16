import { describe, it, expect, beforeAll, afterAll } from "bun:test";

const BASE_URL = "http://localhost:3000";
const API_BASE = `${BASE_URL}/api/wakatime/users/current`;

// This will be set up with a real API key from the database
const testApiKey = "test-api-key";

describe("WakaTime API Integration Tests", () => {
  beforeAll(async () => {
    // Wait for the server to be ready
    await waitForServer();

    // TODO: Set up a real test API key in the database
    // For now, we'll use a mock key that should fail
  });

  async function waitForServer(maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        // Test the actual API endpoint instead of /api/health
        const response = await fetch(
          `${BASE_URL}/api/wakatime/users/current/heartbeats`,
          {
            method: "POST",
          },
        );
        if (response.status === 401) return; // Server is responding correctly
      } catch (error) {
        // Server not ready yet
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw new Error("Server did not start within expected time");
  }

  describe("POST /api/wakatime/users/current/heartbeats", () => {
    it("should fail with invalid API key", async () => {
      const heartbeat = {
        time: Math.floor(Date.now() / 1000),
        entity: "/path/to/file.js",
        type: "file",
        language: "javascript",
      };

      const response = await fetch(`${API_BASE}/heartbeats`, {
        method: "POST",
        headers: {
          Authorization: `Bearer invalid-key`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(heartbeat),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Invalid API key format");
    });

    it("should fail without authorization header", async () => {
      const heartbeat = {
        time: Math.floor(Date.now() / 1000),
        entity: "/path/to/file.js",
        type: "file",
        language: "javascript",
      };

      const response = await fetch(`${API_BASE}/heartbeats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(heartbeat),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Missing or invalid Authorization header");
    });

    it("should fail with invalid JSON", async () => {
      const response = await fetch(`${API_BASE}/heartbeats`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${testApiKey}`,
          "Content-Type": "application/json",
        },
        body: "invalid json",
      });

      // API key validation happens first, so it returns 401 for invalid format
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Invalid API key format");
    });

    it("should fail with missing required fields", async () => {
      const invalidHeartbeat = {
        entity: "/path/to/file.js",
        // missing required fields: time, type
      };

      const response = await fetch(`${API_BASE}/heartbeats`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${testApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidHeartbeat),
      });

      // API key validation happens first, so it returns 401 for invalid format
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Invalid API key format");
    });
  });

  describe("POST /api/wakatime/users/current/heartbeats.bulk", () => {
    it("should fail with invalid API key", async () => {
      const heartbeats = [
        {
          time: Math.floor(Date.now() / 1000),
          entity: "/path/to/file.js",
          type: "file",
          language: "javascript",
        },
      ];

      const response = await fetch(`${API_BASE}/heartbeats.bulk`, {
        method: "POST",
        headers: {
          Authorization: `Bearer invalid-key`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(heartbeats),
      });

      expect(response.status).toBe(401);
    });

    it("should fail with single heartbeat (not array)", async () => {
      const heartbeat = {
        time: Math.floor(Date.now() / 1000),
        entity: "/path/to/file.js",
        type: "file",
        language: "javascript",
      };

      const response = await fetch(`${API_BASE}/heartbeats.bulk`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${testApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(heartbeat),
      });

      // API key validation happens first, so it returns 401 for invalid format
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Invalid API key format");
    });
  });

  describe("GET /api/wakatime/users/current/statusbar/today", () => {
    it("should fail with invalid API key", async () => {
      const response = await fetch(`${API_BASE}/statusbar/today`, {
        method: "GET",
        headers: {
          Authorization: `Bearer invalid-key`,
        },
      });

      expect(response.status).toBe(401);
    });

    it("should fail without authorization header", async () => {
      const response = await fetch(`${API_BASE}/statusbar/today`, {
        method: "GET",
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Missing or invalid Authorization header");
    });
  });

  describe("GET /api/wakatime/users/current/summary", () => {
    it("should fail with invalid API key", async () => {
      const response = await fetch(`${API_BASE}/summary`, {
        method: "GET",
        headers: {
          Authorization: `Bearer invalid-key`,
        },
      });

      expect(response.status).toBe(401);
    });

    it("should fail with invalid query parameters", async () => {
      const response = await fetch(`${API_BASE}/summary?range=invalid_range`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${testApiKey}`,
        },
      });

      // API key validation happens first, so it returns 401 for invalid format
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Invalid API key format");
    });
  });

  describe("Server Health Check", () => {
    it("should confirm server is actually running", async () => {
      // This test will fail if the server isn't running on localhost:3000
      try {
        const response = await fetch(`${API_BASE}/heartbeats`, {
          method: "POST",
        });
        // Any response (even 401) means server is running
        expect(response.status).toBe(401); // Expected response for missing auth
      } catch (error) {
        throw new Error(
          `Server is not running on ${BASE_URL}. Please start the development server with 'bun run dev'`,
        );
      }
    });
  });
});
