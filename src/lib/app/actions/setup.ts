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

  // First try to get existing setup
  let setup = await supabaseService
    .from("user_setup")
    .select("is_completed, last_updated")
    .eq("user_id", auth.user.id)
    .single();

  // If no setup exists, create one
  if (!setup.data) {
    const newSetup = await supabaseService
      .from("user_setup")
      .insert({
        id: nanoid(8),
        user_id: auth.user.id,
        is_completed: false,
        last_updated: new Date().toISOString(),
      })
      .select("is_completed, last_updated")
      .single();

    if (newSetup.error) {
      console.error("Error creating setup status:", newSetup.error);
      return "error";
    }

    setup = newSetup;
  }

  if (setup.error) {
    console.error("Error getting setup status:", setup);
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

  try {
    // First try to update existing setup
    const existingSetup = await supabaseService
      .from("user_setup")
      .update({
        is_completed: state,
        last_updated: new Date().toISOString(),
      })
      .eq("user_id", auth.user.id)
      .select("is_completed, last_updated")
      .single();

    // If update succeeded, return the result
    if (existingSetup.data) {
      return {
        isCompleted: existingSetup.data.is_completed,
        lastUpdated: existingSetup.data.last_updated,
      };
    }

    // If no existing record, create a new one
    const newSetup = await supabaseService
      .from("user_setup")
      .insert({
        id: nanoid(8),
        user_id: auth.user.id,
        is_completed: state,
        last_updated: new Date().toISOString(),
      })
      .select("is_completed, last_updated")
      .single();

    if (newSetup.error) {
      console.error("Error creating setup:", newSetup.error);
      return "error";
    }

    return {
      isCompleted: newSetup.data.is_completed,
      lastUpdated: newSetup.data.last_updated,
    };
  } catch (error) {
    console.error("Error in completeSetup:", error);
    return "error";
  }
}

export async function markSetupCompleteOnFirstHeartbeat(userId: string) {
  try {
    // First try to update existing setup
    const existingSetup = await supabaseService
      .from("user_setup")
      .update({
        is_completed: true,
        last_updated: new Date().toISOString(),
      })
      .eq("user_id", userId);

    // If no rows were updated, create a new setup record
    if (existingSetup.count === 0) {
      await supabaseService.from("user_setup").insert({
        id: nanoid(8),
        user_id: userId,
        is_completed: true,
        last_updated: new Date().toISOString(),
      });
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
