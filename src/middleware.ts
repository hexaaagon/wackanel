import { NextRequest, NextResponse } from "next/server";
import createMiddlewareAuthClient from "./lib/middleware/auth";
import baseMiddleware from "./lib/middleware";

export async function middleware(_request: NextRequest): Promise<NextResponse> {
  const { request, nextResponse, supabase, sessionCookie } =
    createMiddlewareAuthClient(_request);

  return baseMiddleware(request, nextResponse, supabase, sessionCookie);
}
