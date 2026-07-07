import cron from "node-cron";
import { getDb } from "./storage/db";
import { runScanCycle } from "./scheduler/scan-cycle";

async function main(): Promise<void> {
  getDb(); // ensures schema exists before first cycle

  console.log("Mini PC Deal Bot started. Scanning every 2 minutes.");

  await runScanCycle();

  cron.schedule("*/2 * * * *", () => {
    runScanCycle().catch((error) => {
      console.error("[scan] unhandled cycle error:", error);
    });
  });
}

main().catch((error) => {
  console.error("Fatal startup error:", error);
  process.exit(1);
});
