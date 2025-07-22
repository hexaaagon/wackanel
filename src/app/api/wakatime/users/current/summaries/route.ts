import { NextRequest, NextResponse } from "next/server";
import { validateEditorUser } from "@/lib/auth/api-key/validator";
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

    const apiKeyValidation = await validateEditorUser(apiKey);

    if (!apiKeyValidation.valid) {
      return createAuthErrorResponse(
        apiKeyValidation.error || "Invalid API key",
      );
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

    // For now, we'll just return fallback data since OAuth is not implemented
    // TODO: Implement proper OAuth token management and remove this shortcut
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const start = validationResult.data.start || today;
    const end = validationResult.data.end || today;

    return createSuccessResponse({
      data: {
        total_seconds: 0,
        languages: [],
        projects: [],
        start,
        end,
      },
      start,
      end,
      status: "ok",
    });
  } catch (error) {
    console.error("Error in summary endpoint:", error);
    return createServerErrorResponse();
  }
}
