import { chromium } from "playwright";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import * as readline from "node:readline/promises";

const DATA_DIR = join(process.cwd(), "data");
const SESSION_PATH = join(DATA_DIR, "fb-session.json");

async function main(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://www.facebook.com/login");

  console.log("\nĐăng nhập Facebook thủ công trong cửa sổ trình duyệt vừa mở.");
  console.log("Xử lý luôn 2FA/captcha nếu Facebook yêu cầu.");
  console.log("Sau khi đăng nhập xong và thấy trang chủ Facebook, quay lại đây và nhấn Enter.\n");

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await rl.question("Nhấn Enter khi đã đăng nhập xong... ");
  rl.close();

  await context.storageState({ path: SESSION_PATH });
  console.log(`\nĐã lưu session vào ${SESSION_PATH}`);

  await browser.close();
}

main().catch((error) => {
  console.error("Login script failed:", error);
  process.exit(1);
});
