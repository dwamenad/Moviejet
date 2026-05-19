import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { getPublicContentPayload } from "@/lib/public-content";

type PublicSiteSyncResult = {
  deployHookTriggered: boolean;
  errors: string[];
  snapshotPath: string | null;
  snapshotWritten: boolean;
};

type PublicSiteSyncContext = {
  reason: string;
  slug?: string;
  storyId?: string;
};

function getSnapshotPath() {
  const configuredPath = process.env.PUBLIC_CONTENT_SNAPSHOT_PATH?.trim();

  if (configuredPath) {
    return configuredPath;
  }

  if (process.env.NODE_ENV === "development") {
    return join(process.cwd(), "apps", "public-site", "content", "published-content.json");
  }

  return null;
}

async function writePublicSnapshot(snapshotPath: string) {
  const payload = await getPublicContentPayload();
  await mkdir(dirname(snapshotPath), { recursive: true });
  await writeFile(snapshotPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

async function triggerPublicDeployHook(context: PublicSiteSyncContext) {
  const deployHookUrl = process.env.PUBLIC_SITE_DEPLOY_HOOK_URL?.trim();

  if (!deployHookUrl) {
    return false;
  }

  const response = await fetch(deployHookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...context,
      requestedAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Public deploy hook returned ${response.status}`);
  }

  return true;
}

export async function syncPublicSite(context: PublicSiteSyncContext): Promise<PublicSiteSyncResult> {
  const errors: string[] = [];
  const snapshotPath = getSnapshotPath();
  let snapshotWritten = false;
  let deployHookTriggered = false;

  if (snapshotPath) {
    try {
      await writePublicSnapshot(snapshotPath);
      snapshotWritten = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown snapshot write error";
      errors.push(`snapshot: ${message}`);
      console.error("Failed to write public snapshot", error);
    }
  }

  try {
    deployHookTriggered = await triggerPublicDeployHook(context);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown deploy hook error";
    errors.push(`deploy-hook: ${message}`);
    console.error("Failed to trigger public deploy hook", error);
  }

  return {
    snapshotPath,
    snapshotWritten,
    deployHookTriggered,
    errors,
  };
}

export function formatPublicSiteSyncMessage(baseMessage: string, result: PublicSiteSyncResult) {
  if (result.deployHookTriggered) {
    return `${baseMessage} Public site rebuild requested.`;
  }

  if (result.snapshotWritten) {
    return `${baseMessage} Local public snapshot updated.`;
  }

  if (result.errors.length > 0) {
    return `${baseMessage} Public sync needs manual attention.`;
  }

  return `${baseMessage} Run the public-site build or configure PUBLIC_SITE_DEPLOY_HOOK_URL to publish the latest content.`;
}
