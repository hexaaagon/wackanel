import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key-validator";
import { wakatimeApiClient } from "@/lib/backend/client/wakatime";
import { summaryQuerySchema } from "@/shared/schemas/wakatime";
import {
  createValidationErrorResponse,
  createAuthErrorResponse,
  createServerErrorResponse,
  createSuccessResponse,
} from "@/lib/utils/api-responses";

// GET /api/wakatime/users/current/summaries
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

    const url = new URL(request.url);
    const queryParams = {
      start: url.searchParams.get("start"),
      end: url.searchParams.get("end"),
      range: url.searchParams.get("range"),
      project: url.searchParams.get("project"),
      branches: url.searchParams.get("branches"),
      timeout: url.searchParams.get("timeout")
        ? parseInt(url.searchParams.get("timeout")!)
        : undefined,
      writes_only: url.searchParams.get("writes_only") === "true",
      timezone: url.searchParams.get("timezone"),
    };

    const cleanedParams = Object.fromEntries(
      Object.entries(queryParams).filter(
        ([_, value]) => value !== null && value !== undefined,
      ),
    );

    const validationResult = summaryQuerySchema.safeParse(cleanedParams);
    if (!validationResult.success) {
      return createValidationErrorResponse(
        validationResult.error,
        "Invalid query parameters",
      );
    }

    // Try to fetch from external WakaTime API first
    const externalData = await wakatimeApiClient.getSummary(
      user.userId,
      validationResult.data,
    );

    if (externalData) {
      return createSuccessResponse({
        ...externalData,
        status: "ok",
      });
    }

    // If external API fails, return empty data (fallback)
    const now = new Date();
    const start =
      validationResult.data.start ||
      new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const end = validationResult.data.end || now.toISOString();

    return createSuccessResponse({
      data: [],
      start,
      end,
      status: "ok",
    });
  } catch (error) {
    console.error("Error in summary endpoint:", error);
    return createServerErrorResponse();
  }
}
