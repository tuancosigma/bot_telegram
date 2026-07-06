import type { Locator } from "playwright";
import type { RawPost } from "./types";

const PERMALINK_PATTERNS = [/\/permalink\//, /\/posts\//, /story_fbid=/, /\/groups\/[^/]+\/user\//];

async function expandTruncatedText(article: Locator): Promise<void> {
  const seeMoreButtons = article.locator('div[role="button"]:has-text("Xem thêm")');
  const count = await seeMoreButtons.count().catch(() => 0);
  for (let i = 0; i < count; i += 1) {
    await seeMoreButtons
      .nth(i)
      .click({ timeout: 2000 })
      .catch(() => {
        // button may have disappeared after a previous click re-rendered the DOM — safe to ignore
      });
  }
}

async function extractPermalink(article: Locator): Promise<string | null> {
  const links = article.locator("a[href]");
  const count = await links.count().catch(() => 0);
  for (let i = 0; i < count; i += 1) {
    const href = await links.nth(i).getAttribute("href").catch(() => null);
    if (href && PERMALINK_PATTERNS.some((pattern) => pattern.test(href))) {
      return href.startsWith("http") ? href : `https://www.facebook.com${href}`;
    }
  }
  return null;
}

async function extractAuthorName(article: Locator): Promise<string> {
  const strongLink = article.locator("h3 a, h2 a, strong a").first();
  const text = await strongLink.innerText().catch(() => "");
  return text.trim() || "Không rõ";
}

async function extractLocation(article: Locator): Promise<string | null> {
  // FB group posts sometimes show a location link near the author byline (marketplace-style
  // listings). DOM structure is unstable — best-effort only, formatter shows N/A if not found.
  const locationLink = article.locator('a[href*="/search/top/?q="], a[href*="/places/"]').first();
  const text = await locationLink.innerText().catch(() => "");
  return text.trim() || null;
}

async function extractImageUrls(article: Locator): Promise<string[]> {
  const images = article.locator("img[src]");
  const count = await images.count().catch(() => 0);
  const urls: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const src = await images.nth(i).getAttribute("src").catch(() => null);
    // FB profile/emoji icons are small avatar/reaction sprites, not post photos — skip via size hint in src
    if (src && !src.includes("emoji") && !src.includes("static.xx.fbcdn.net/rsrc")) {
      urls.push(src);
    }
  }
  return [...new Set(urls)];
}

export async function extractPost(article: Locator, groupName: string): Promise<RawPost | null> {
  await expandTruncatedText(article);

  const url = await extractPermalink(article);
  if (!url) return null;

  const textContent = (await article.innerText().catch(() => "")).trim();
  if (!textContent) return null;

  const authorName = await extractAuthorName(article);
  const location = await extractLocation(article);
  const imageUrls = await extractImageUrls(article);

  return {
    url,
    groupName,
    authorName,
    location,
    textContent,
    postedAtRelative: "unknown",
    imageUrls,
  };
}
