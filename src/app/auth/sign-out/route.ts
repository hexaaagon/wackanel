import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  await auth.api.signOut({
    headers: req.headers,
  });

  return Response.redirect(`${req.nextUrl.origin}/?action=sign-out`, 307);
}
