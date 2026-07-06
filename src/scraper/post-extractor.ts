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

function normalizePermalink(href: string): string {
  const absolute = href.startsWith("http") ? href : `https://www.facebook.com${href}`;
  const url = new URL(absolute);
  // Strip query params (comment_id, __cft__, __tn__, ...) so a comment permalink normalizes
  // to the same URL as its parent post — prevents one post from being extracted twice.
  return `${url.origin}${url.pathname}`;
}

async function extractPermalink(article: Locator): Promise<string | null> {
  const links = article.locator("a[href]");
  const count = await links.count().catch(() => 0);
  for (let i = 0; i < count; i += 1) {
    const href = await links.nth(i).getAttribute("href").catch(() => null);
    if (href && PERMALINK_PATTERNS.some((pattern) => pattern.test(href))) {
      return normalizePermalink(href);
    }
  }
  return null;
}

async function extractAuthorName(article: Locator, textContent: string): Promise<string> {
  const preferredSelectors = ['h3 a', "h2 a", "strong a"];
  for (const selector of preferredSelectors) {
    const text = await article
      .locator(selector)
      .first()
      .innerText()
      .catch(() => "");
    if (text.trim()) return text.trim();
  }

  // Fallback: the author link is typically the first anchor in the post that isn't
  // the permalink/timestamp link and has short, name-like text.
  const links = article.locator("a[href]");
  const count = await links.count().catch(() => 0);
  for (let i = 0; i < count; i += 1) {
    const link = links.nth(i);
    const href = await link.getAttribute("href").catch(() => null);
    if (!href || PERMALINK_PATTERNS.some((pattern) => pattern.test(href))) continue;
    const text = (await link.innerText().catch(() => "")).trim();
    if (text && text.length <= 60) return text;
  }

  // Last resort: FB renders the author's display name as the first line of the post
  // header, before the relative timestamp — obfuscated class names make it unselectable
  // directly, but the rendered text order is stable.
  const firstLine = textContent.split("\n")[0]?.trim();
  if (firstLine && firstLine.length <= 60) return firstLine;

  return "Không rõ";
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

  const authorName = await extractAuthorName(article, textContent);
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
