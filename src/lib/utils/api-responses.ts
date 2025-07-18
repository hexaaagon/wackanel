import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Creates a standardized error response for validation errors
 */
export function createValidationErrorResponse(
  error: ZodError,
  message: string = "Validation failed",
) {
  return NextResponse.json(
    {
      error: message,
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      })),
    },
    { status: 400 },
  );
}

/**
 * Creates a standardized error response for authentication errors
 */
export function createAuthErrorResponse(
  message: string = "Authentication failed",
) {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Creates a standardized error response for server errors
 */
export function createServerErrorResponse(
  message: string = "Internal server error",
) {
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * Creates a standardized success response for API endpoints
 */
export function createSuccessResponse(data: unknown, status: number = 200) {
  return NextResponse.json(data, { status });
}
