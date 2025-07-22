import { NextRequest, NextResponse } from "next/server";
import { validateEditorUser } from "@/lib/auth/api-key/validator";
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

    const apiKeyValidation = await validateEditorUser(apiKey);

    if (!apiKeyValidation.valid) {
      return createAuthErrorResponse(
        apiKeyValidation.error || "Invalid API key",
      );
    }

    // For now, we'll just return fallback data since OAuth is not implemented
    // TODO: Implement proper OAuth token management and remove this shortcut
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
        grand_total: {
          total_seconds: 0,
          digital: "0s",
          text: "0s",
        },
        projects: [],
        languages: [],
      },
    });
  } catch (error) {
    console.error("Error in statusbar/today endpoint:", error);
    return createServerErrorResponse();
  }
}
