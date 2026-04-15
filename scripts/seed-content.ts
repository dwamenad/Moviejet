import { resetSeedContent } from "../src/lib/content";

resetSeedContent().catch((error) => {
  console.error(error);
  process.exit(1);
});
