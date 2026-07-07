import { chromium, type Browser } from "playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { parseRawArticle } from "./post-extractor";
import type { RawPost } from "./types";

const SESSION_PATH = join(process.cwd(), "data", "fb-session.json");
const SCROLL_ROUNDS = 2;
const SCROLL_DELAY_MS = 1500;

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

  // Block images and fonts to save bandwidth and speed up page load
  await page.route("**/*", (route) => {
    const type = route.request().resourceType();
    if (type === "image" || type === "font") {
      route.abort();
    } else {
      route.continue();
    }
  });

  try {
    await page.goto(groupUrl, { waitUntil: "domcontentloaded" });
    // Wait for the first article to load, fallback to a short timeout
    await page.waitForSelector('div[role="article"]', { timeout: 5000 }).catch(() => {});

    if (page.url().includes("facebook.com/login") || page.url().includes("facebook.com/checkpoint")) {
      throw new Error(
        `Facebook redirected to login page. Your session in ${SESSION_PATH} is expired or invalid. Please run "npm run fb-login" to renew your session.`
      );
    }

    await naturalScroll(page);

    // Expand all "Xem thêm" / "See more" buttons on the page first (up to a max of 20 to avoid bottlenecks)
    const seeMoreButtons = page.locator('div[role="button"]:has-text("Xem thêm"), div[role="button"]:has-text("See more")');
    const seeMoreCount = await seeMoreButtons.count().catch(() => 0);
    for (let i = 0; i < Math.min(seeMoreCount, 20); i += 1) {
      await seeMoreButtons.nth(i).click({ timeout: 1500 }).catch(() => {});
    }

    // Single evaluation to fetch link, image, and text details of all article elements on the page.
    // This runs in a single CDP roundtrip and is immune to dynamic DOM changes.
    const rawArticles = await page.evaluate(() => {
      const articleEls = Array.from(document.querySelectorAll('div[role="article"]'));
      return articleEls.map((el) => {
        const links = Array.from(el.querySelectorAll("a[href]")).map((a) => ({
          href: a.getAttribute("href") ?? "",
          text: (a as HTMLElement).innerText?.trim() ?? "",
        }));
        const images = Array.from(el.querySelectorAll("img[src]")).map(
          (img) => img.getAttribute("src") ?? ""
        );
        const textContent = (el as HTMLElement).innerText?.trim() ?? "";
        return { links, images, textContent };
      });
    });

    const posts: RawPost[] = [];
    const seenUrls = new Set<string>();
    for (const rawData of rawArticles) {
      try {
        const post = parseRawArticle(rawData, groupName);
        if (!post || seenUrls.has(post.url)) continue;
        seenUrls.add(post.url);
        posts.push(post);
      } catch (error) {
        console.error(`[scraper] failed to parse raw article in ${groupName}:`, error);
      }
    }

    return posts;
  } finally {
    await browser.close();
  }
}
