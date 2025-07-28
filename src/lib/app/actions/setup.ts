"use server";
import { generateEditorKey } from "@/lib/auth/api-key/generate";
import { getAuth } from "@/lib/auth/server";

import { supabaseService } from "@/lib/database/supabase/service-server";

import { nanoid } from "@/lib/utils";

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

  const installerToken = apiKey.key;

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
  const auth = await getAuth();

  if (!auth?.user.id) {
    return { sent: false };
  }

  try {
    const heartbeat = await supabaseService
      .from("user_wakatime_heartbeats")
      .select("updated_at")
      .eq("user_id", auth.user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (heartbeat.data && heartbeat.data.updated_at) {
      return {
        sent: true,
        lastSent: new Date(heartbeat.data.updated_at),
      };
    }

    return { sent: false };
  } catch (error) {
    console.error("Error checking heartbeat:", error);
    return { sent: false };
  }
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

export async function markSetupCompleteOnFirstHeartbeat(userId: string) {
  try {
    // Check if setup is already completed
    const existingSetup = await supabaseService
      .from("user_setup")
      .select("is_completed")
      .eq("user_id", userId)
      .single();

    // If setup doesn't exist or is not completed, mark it as complete
    if (!existingSetup.data || !existingSetup.data.is_completed) {
      await supabaseService
        .from("user_setup")
        .upsert({
          id: nanoid(8),
          user_id: userId,
          is_completed: true,
          last_updated: new Date().toISOString(),
        })
        .eq("user_id", userId);
    }
  } catch (error) {
    console.error("Error marking setup complete on first heartbeat:", error);
  }
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
