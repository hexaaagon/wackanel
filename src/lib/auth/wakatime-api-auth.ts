/**
 * Authentication utility for WakaTime API endpoints.
 *
 * This module provides dual authentication support:
 * 1. API Key Authentication - For WakaTime editor extensions using Basic Auth
 * 2. Better Auth Session Authentication - For browser-based access to WakaTime APIs
 *
 * Usage in API routes:
 * ```typescript
 * const authResult = await validateWakatimeApiAuth(request);
 * if (!authResult.success) {
 *   return createAuthErrorResponse(authResult.error);
 * }
 * // Use authResult.userId for authenticated requests
 * ```
 */

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { validateEditorUser } from "@/lib/auth/api-key/validator";

export type AuthResult =
  | {
      success: true;
      userId: string;
      authMethod: "api-key" | "session";
    }
  | {
      success: false;
      error: string;
    };

/**
 * Validates authentication for WakaTime API endpoints.
 * Supports both API key authentication (for editor extensions)
 * and Better Auth session authentication (for browser access).
 */
export async function validateWakatimeApiAuth(
  request: NextRequest,
): Promise<AuthResult> {
  // First, try API key authentication (existing method)
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Basic ")) {
    try {
      const apiKey = atob(authHeader.replace("Basic ", ""));
      const apiKeyValidation = await validateEditorUser(apiKey);

      if (apiKeyValidation.valid) {
        return {
          success: true,
          userId: apiKeyValidation.userId,
          authMethod: "api-key",
        };
      }

      return {
        success: false,
        error: apiKeyValidation.error || "Invalid API key",
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to decode API key",
      };
    }
  }

  // If no API key, try session authentication (Better Auth)
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (session?.user?.id) {
      return {
        success: true,
        userId: session.user.id,
        authMethod: "session",
      };
    }

    return {
      success: false,
      error: "No valid session found",
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to validate session",
    };
  }
}
