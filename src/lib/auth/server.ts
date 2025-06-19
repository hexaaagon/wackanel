"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
}
