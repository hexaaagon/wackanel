import { absoluteUrl } from "@/lib/utils";

export async function GET() {
  return Response.redirect(absoluteUrl("/dashboard"), 307);
}
