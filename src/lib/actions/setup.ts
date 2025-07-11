"use server";
import { auth } from "@/lib/auth";
import { getAuth } from "@/lib/auth/server";

import { createServiceServer } from "@/lib/db_supabase/service-server";

import { nanoid } from "@/lib/utils";
import { headers } from "next/headers";

export async function getApiKey(user?: Awaited<ReturnType<typeof getAuth>>) {
  if (!user) {
    user = await getAuth();
    if (!user) return "unauthenticated";
  }

  const supabase = createServiceServer();

  const userApiKeys = (
    await auth.api.listApiKeys({
      headers: await headers(),
    })
  ).filter(
    (key) => key.userId === user.user.id && key.name === "Editor API Key",
  );

  const apiKey =
    userApiKeys.length === 0
      ? await auth.api
          .createApiKey({
            body: {
              name: "Editor API Key",
              prefix: "editor_",
              userId: user.user.id,
            },
          })
          .then((res) => ({
            type: "created",
            key: res.key,
            body: res,
          }))
          .catch((error) => {
            console.error("Error creating API key:", error);
          })
      : await supabase
          .from("apikey")
          .select("prefix, key")
          .eq("user_id", user.user.id)
          .single()
          .then((res) => ({
            type: "fetched",
            key: `${res.data?.prefix}${res.data?.key}`,
            body: res,
          }));

  return apiKey?.key || "error";
}

export async function generateInstallerKey() {
  const auth = await getAuth();

  const apiKey = await getApiKey(auth);
  const installerToken = `${auth?.user.id}.${apiKey.split("_")[1]}`;

  return {
    apiKey,
    installerToken,
  };
}

export async function hasSentHeartbeat(): Promise<
  | {
      sent: false;
    }
  | {
      sent: true;
      lastSent: Date;
    }
> {
  return Math.random() > 0.5
    ? {
        sent: false,
      }
    : {
        sent: true,
        lastSent: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60)),
      };
}

export async function getSetupStatus() {
  const auth = await getAuth();
  const supabase = createServiceServer();

  if (!auth?.user.id) {
    return "unauthenticated";
  }

  let setup = await supabase
    .from("user_setup")
    .select("is_completed, last_updated")
    .eq("user_id", auth.user.id)
    .single();

  if (!setup.data) {
    setup = await supabase
      .from("user_setup")
      .insert({
        id: nanoid(8),
        user_id: auth.user.id,
        is_completed: false,
        last_updated: new Date().toISOString(),
      })
      .select("is_completed, last_updated")
      .single();
  }

  if (setup.error) {
    console.error("Error completing setup:", setup);
    return "error";
  }

  return {
    isCompleted: setup.data.is_completed,
    lastUpdated: setup.data.last_updated,
  };
}

export async function completeSetup(state = true) {
  const auth = await getAuth();
  const supabase = createServiceServer();

  if (!auth?.user.id) {
    return "unauthenticated";
  }

  let setup = await supabase
    .from("user_setup")
    .select("id, is_completed, last_updated")
    .eq("user_id", auth.user.id)
    .single();

  if (!setup.data || setup.data.is_completed !== state) {
    setup = await supabase
      .from("user_setup")
      .upsert({
        id: setup.data?.id || nanoid(8),
        user_id: auth.user.id,
        is_completed: state,
        last_updated: new Date().toISOString(),
      })
      .select("is_completed, last_updated")
      .single();
  }

  if (setup.error) {
    console.error("Error completing setup:", setup);
    return "error";
  }

  return {
    isCompleted: setup.data.is_completed,
    lastUpdated: setup.data.last_updated,
  };
}
