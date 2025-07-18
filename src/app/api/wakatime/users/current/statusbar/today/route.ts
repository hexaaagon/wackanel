import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key-validator";
import { wakatimeApiClient } from "@/lib/backend/client/wakatime";
import {
  createAuthErrorResponse,
  createServerErrorResponse,
  createSuccessResponse,
} from "@/lib/utils/api-responses";

// GET /api/wakatime/users/current/statusbar/today
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return createAuthErrorResponse("Missing or invalid Authorization header");
    }

    const apiKey = authHeader.replace("Bearer ", "");

    const apiKeyValidation = await validateApiKey(apiKey);

    if (!apiKeyValidation.valid) {
      return createAuthErrorResponse(
        apiKeyValidation.error || "Invalid API key",
      );
    }

    const user = apiKeyValidation.apiKey.key;

    if (!user || !user.userId) {
      return createAuthErrorResponse("Invalid API key structure");
    }

    // Try to fetch from external WakaTime API first
    const externalData = await wakatimeApiClient.getStatusbar(user.userId);

    if (externalData) {
      return createSuccessResponse(externalData);
    }

    // If external API fails, return empty data (fallback)
    return createSuccessResponse({
      data: {
        cached_at: new Date().toISOString(),
        decimal: "0.00",
        digital: "0s",
        percent: 0,
        text: "0s",
        timeout: 15,
        total_seconds: 0,
        project: null,
        category: null,
        language: null,
        is_coding: false,
      },
    });
  } catch (error) {
    console.error("Error in statusbar/today endpoint:", error);
    return createServerErrorResponse();
  }
}
