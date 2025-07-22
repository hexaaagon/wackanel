"use server";
import { auth } from "@/lib/auth";
import { generateEditorKey } from "@/lib/auth/api-key/generate";
import { getAuth } from "@/lib/auth/server";

import { supabaseService } from "@/lib/database/supabase/service-server";

import { nanoid } from "@/lib/utils";
import { headers } from "next/headers";

export async function getApiKey(user?: Awaited<ReturnType<typeof getAuth>>) {
  if (!user) {
    user = await getAuth();
    if (!user) return "unauthenticated";
  }

  const key = await generateEditorKey(user.user.id);

  return key || "error";
}

export async function generateInstallerKey() {
  const auth = await getAuth();

  const apiKey = await getApiKey(auth);
  if (typeof apiKey === "string") {
    return apiKey;
  }

  const installerToken = `${auth?.user.id}.${apiKey.key.split(".")[0]}`;

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

  if (!auth?.user.id) {
    return "unauthenticated";
  }

  let setup = await supabaseService
    .from("user_setup")
    .select("is_completed, last_updated")
    .eq("user_id", auth.user.id)
    .single();

  if (!setup.data) {
    setup = await supabaseService
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

  if (!auth?.user.id) {
    return "unauthenticated";
  }

  let setup = await supabaseService
    .from("user_setup")
    .select("id, is_completed, last_updated")
    .eq("user_id", auth.user.id)
    .single();

  if (!setup.data || setup.data.is_completed !== state) {
    setup = await supabaseService
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

export async function restartSetup() {
  const auth = await getAuth();

  if (!auth?.user.id) {
    return "unauthenticated";
  }

  const setup = await supabaseService
    .from("user_setup")
    .update({
      is_completed: false,
      last_updated: new Date().toISOString(),
    })
    .eq("user_id", auth.user.id)
    .select("is_completed, last_updated")
    .single();

  if (setup.error) {
    console.error("Error restarting setup:", setup);
    return "error";
  }

  return {
    isCompleted: setup.data.is_completed,
    lastUpdated: setup.data.last_updated,
  };
}
