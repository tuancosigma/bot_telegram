import type { Locator } from "playwright";
import type { RawPost } from "./types";

const PERMALINK_PATTERNS = [/\/permalink\//, /\/posts\//, /story_fbid=/, /\/groups\/[^/]+\/user\//];
const RELATIVE_TIME_PATTERN =
  /^\d+\s*(giây|phút|giờ|ngày|tuần|tháng|năm)|^(Hôm qua|Vừa xong|Yesterday|\d+\s*(second|minute|hour|day|week|month|year)s?)/i;

interface RawArticleData {
  links: Array<{ href: string; text: string }>;
  images: string[];
  textContent: string;
}

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

// Single round-trip into the page per post: reads every link, image, and the full text
// in one evaluate() call instead of dozens of separate locator.count()/nth() round-trips
// (the previous approach took ~50+ CDP round-trips per post and dominated scan time).
async function extractRawData(article: Locator): Promise<RawArticleData> {
  return article.evaluate((el) => {
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
}

function normalizePermalink(href: string): string {
  const absolute = href.startsWith("http") ? href : `https://www.facebook.com${href}`;
  const url = new URL(absolute);
  // Strip query params (comment_id, __cft__, __tn__, ...) so a comment permalink normalizes
  // to the same URL as its parent post — prevents one post from being extracted twice.
  return `${url.origin}${url.pathname}`;
}

function extractPermalink(data: RawArticleData): string | null {
  for (const link of data.links) {
    if (link.href && PERMALINK_PATTERNS.some((pattern) => pattern.test(link.href))) {
      return normalizePermalink(link.href);
    }
  }
  return null;
}

function extractAuthorName(data: RawArticleData): string {
  // The author link is typically the first anchor that isn't the permalink/timestamp link
  // and has short, name-like text.
  for (const link of data.links) {
    if (!link.href || PERMALINK_PATTERNS.some((pattern) => pattern.test(link.href))) continue;
    if (link.text && link.text.length <= 60) return link.text;
  }

  // Last resort: FB renders the author's display name as the first line of the post
  // header, before the relative timestamp — obfuscated class names make it unselectable
  // directly, but the rendered text order is stable.
  const firstLine = data.textContent.split("\n")[0]?.trim();
  if (firstLine && firstLine.length <= 60) return firstLine;

  return "Không rõ";
}

function extractPostedAt(data: RawArticleData): string {
  // FB wraps the relative timestamp ("2 giờ", "5 phút") in a link near the author byline.
  for (const link of data.links) {
    if (RELATIVE_TIME_PATTERN.test(link.text)) return link.text;
  }

  // Fallback: mirrors extractAuthorName's approach — FB renders the timestamp as the
  // second line of the post header (author name, then relative time, then "·").
  const secondLine = data.textContent.split("\n")[1]?.trim();
  if (secondLine && RELATIVE_TIME_PATTERN.test(secondLine)) return secondLine;

  return "unknown";
}

function extractLocation(data: RawArticleData): string | null {
  // FB group posts sometimes show a location link near the author byline (marketplace-style
  // listings). DOM structure is unstable — best-effort only, formatter shows N/A if not found.
  const locationLink = data.links.find(
    (link) => link.href.includes("/search/top/?q=") || link.href.includes("/places/")
  );
  return locationLink?.text || null;
}

function extractImageUrls(data: RawArticleData): string[] {
  const urls = data.images.filter(
    (src) =>
      // FB profile/emoji icons are small avatar/reaction sprites, not post photos.
      // Telegram only accepts HTTP/HTTPS URLs, so data: URIs / inline SVG must be excluded.
      src.startsWith("http") && !src.includes("emoji") && !src.includes("static.xx.fbcdn.net/rsrc")
  );
  return [...new Set(urls)];
}

export async function extractPost(article: Locator, groupName: string): Promise<RawPost | null> {
  await expandTruncatedText(article);

  const data = await extractRawData(article);

  const url = extractPermalink(data);
  if (!url) return null;
  if (!data.textContent) return null;

  return {
    url,
    groupName,
    authorName: extractAuthorName(data),
    location: extractLocation(data),
    textContent: data.textContent,
    postedAtRelative: extractPostedAt(data),
    imageUrls: extractImageUrls(data),
  };
}
