import { chromium } from "playwright";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), "data");
const SESSION_PATH = join(DATA_DIR, "fb-session.json");
const LOGIN_WAIT_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes to allow 2FA/captcha

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
  console.log("Script sẽ tự động phát hiện khi bạn đăng nhập xong (tối đa chờ 10 phút).\n");

  // Detect successful login by waiting until the c_user cookie is set in the browser context.
  // This is the most reliable way as Facebook landing page (even if not logged in) can have pathname "/".
  let loggedIn = false;
  const pollIntervalMs = 2000;
  const maxPolls = LOGIN_WAIT_TIMEOUT_MS / pollIntervalMs;
  for (let i = 0; i < maxPolls; i += 1) {
    const cookies = await context.cookies();
    const hasCUser = cookies.some((c) => c.name === "c_user");
    if (hasCUser) {
      loggedIn = true;
      break;
    }
    // Also check if page is closed
    if (page.isClosed()) {
      break;
    }
    await page.waitForTimeout(pollIntervalMs);
  }

  if (!loggedIn) {
    throw new Error("Đăng nhập thất bại hoặc trình duyệt bị đóng trước khi đăng nhập xong.");
  }

  // Give the page a moment to finish setting all auth cookies after redirect.
  await page.waitForTimeout(3000);

  await context.storageState({ path: SESSION_PATH });
  console.log(`\nĐã lưu session vào ${SESSION_PATH}`);

  await browser.close();
}

main().catch((error) => {
  console.error("Login script failed:", error);
  process.exit(1);
});
