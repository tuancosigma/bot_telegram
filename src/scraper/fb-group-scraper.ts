import { chromium, type Browser } from "playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { extractPost } from "./post-extractor";
import type { RawPost } from "./types";

const SESSION_PATH = join(process.cwd(), "data", "fb-session.json");
const SCROLL_ROUNDS = 4;
const SCROLL_DELAY_MS = 2500;

function assertSessionExists(): void {
  if (!existsSync(SESSION_PATH)) {
    throw new Error(
      `Facebook session not found at ${SESSION_PATH}. Run "npm run fb-login" first to log in.`
    );
  }
}

async function naturalScroll(page: import("playwright").Page): Promise<void> {
  for (let i = 0; i < SCROLL_ROUNDS; i += 1) {
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(SCROLL_DELAY_MS);
  }
}

export async function scrapeGroup(groupUrl: string, groupName: string): Promise<RawPost[]> {
  assertSessionExists();

  const browser: Browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: SESSION_PATH });
  const page = await context.newPage();

  try {
    await page.goto(groupUrl, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    await naturalScroll(page);

    const articles = page.locator('div[role="article"]');
    const count = await articles.count();

    const posts: RawPost[] = [];
    for (let i = 0; i < count; i += 1) {
      const post = await extractPost(articles.nth(i), groupName).catch((error) => {
        console.error(`[scraper] failed to extract post ${i} in ${groupName}:`, error);
        return null;
      });
      if (post) posts.push(post);
    }

    return posts;
  } finally {
    await browser.close();
  }
}
