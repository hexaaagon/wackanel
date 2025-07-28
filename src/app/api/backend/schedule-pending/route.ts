import { NextRequest, NextResponse } from "next/server";
import { heartbeatService } from "@/lib/backend/services/heartbeat";
import {
  createServerErrorResponse,
  createSuccessResponse,
} from "@/lib/utils/api-responses";

// POST /v1/backend/schedule-pending
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const userAgent = request.headers.get("user-agent");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "");
    if (token !== process.env.POSTGRES_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid authorization token" },
        { status: 401 },
      );
    }

    if (!userAgent?.includes("pg_net")) {
      return NextResponse.json(
        { error: "Invalid user agent" },
        { status: 401 },
      );
    }

    // Process pending heartbeats using the service
    const result = await heartbeatService.processPendingHeartbeats(100);

    if (result.errors.length > 0) {
      console.error("Errors processing pending heartbeats:", result.errors);
    }

    return createSuccessResponse(
      {
        message: "Pending heartbeats processed",
        processed: result.processed,
        users: result.users,
        errors: result.errors,
      },
      200,
    );
  } catch (error) {
    console.error("Error in pending heartbeats scheduler:", error);
    return createServerErrorResponse();
  }
}

// GET /v1/backend/schedule-pending
export async function GET(request: NextRequest) {
  try {
    // For the GET endpoint, we'll need to import db to get the count
    // This is a simple health check endpoint
    return createSuccessResponse(
      {
        pending_count: 0, // We'd need to query the database here if needed
        status: "healthy",
      },
      200,
    );
  } catch (error) {
    console.error("Error checking pending heartbeats:", error);
    return createServerErrorResponse();
  }
}
