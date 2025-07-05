"use server";
import { getAuth } from "@/lib/auth/server";
import { nanoid } from "@/lib/utils";

export async function getApiKey(userId?: Awaited<ReturnType<typeof getAuth>>) {
  if (!userId) {
    userId = await getAuth();
  }
  await sleep(3000);

  return "your-api-key-1234567890abcdef";
}

export async function generateInstallerKey() {
  const auth = await getAuth();

  const apiKey = await getApiKey(auth);
  const installerToken = nanoid(8);

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
  await sleep(3000);

  return Math.random() > 0.5
    ? {
        sent: false,
      }
    : {
        sent: true,
        lastSent: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60)),
      };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
