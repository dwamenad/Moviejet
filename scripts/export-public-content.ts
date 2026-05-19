import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { getPublicContentPayload } from "../src/lib/public-content";

async function main() {
  const payload = await getPublicContentPayload();
  const snapshotPath =
    process.env.PUBLIC_CONTENT_SNAPSHOT_PATH?.trim() ||
    join(process.cwd(), "apps", "public-site", "content", "published-content.json");

  await mkdir(dirname(snapshotPath), { recursive: true });
  await writeFile(snapshotPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote public snapshot to ${snapshotPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
