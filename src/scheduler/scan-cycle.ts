import { loadGroups } from "../config/groups";
import { scrapeGroup } from "../scraper/fb-group-scraper";
import { isMiniPcPost } from "../filter/minipc-keyword-filter";
import { isSeen, markSeen } from "../storage/seen-posts-repo";
import { extractPostSpec } from "../ai/post-spec-extractor";
import { computePricing } from "../ai/pricing-rules";
import { evaluateDeal } from "../ai/deal-evaluator";
import { formatDealMessage } from "../telegram/message-formatter";
import { sendDealMessage } from "../telegram/telegram-sender";

function isWithinLastDay(relativeTime: string): boolean {
  const normalized = relativeTime.toLowerCase().trim();
  if (
    normalized === "unknown" ||
    normalized === "vừa xong" ||
    normalized === "hôm qua" ||
    normalized === "just now" ||
    normalized === "yesterday"
  ) {
    return true;
  }

  // Example: "2 giờ", "5 phút", "23 hours", "1 day", "1 ngày"
  const match = normalized.match(/^(\d+)\s*(giây|phút|giờ|ngày|second|minute|hour|day)s?$/);
  if (!match) {
    return false;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  if (unit === "ngày" || unit === "day") {
    return value <= 1;
  }

  return true;
}

async function processGroup(group: { name: string; url: string }): Promise<void> {
  console.log(`[scan] scraping ${group.name}...`);
  const posts = await scrapeGroup(group.url, group.name);
  console.log(`[scan] ${group.name}: found ${posts.length} posts`);

  let sentCount = 0;
  for (const post of posts) {
    if (isSeen(post.url)) continue;
    if (!isWithinLastDay(post.postedAtRelative)) {
      console.log(`[scan] Skipping old post (${post.postedAtRelative}): ${post.url}`);
      markSeen(post.url, post.groupName);
      continue;
    }
    if (!isMiniPcPost(post.textContent)) {
      markSeen(post.url, post.groupName);
      continue;
    }

    try {
      const spec = await extractPostSpec(post.textContent);
      if (spec.isQuestionOrDiscussion === true) {
        console.log(`[scan] Skipping question/discussion post: ${post.url}`);
        continue;
      }
      const pricing = computePricing(spec);
      const evaluation = await evaluateDeal(spec, pricing, post.textContent);
      const message = formatDealMessage(post, spec, pricing, evaluation);

      await sendDealMessage(message, post.imageUrls);
      sentCount += 1;
    } catch (error) {
      console.error(`[scan] failed to process post ${post.url}:`, error);
    } finally {
      markSeen(post.url, post.groupName);
    }
  }

  console.log(`[scan] ${group.name}: sent ${sentCount} deal(s)`);
}

export async function runScanCycle(): Promise<void> {
  const groups = loadGroups();
  console.log(`[scan] cycle started, ${groups.length} group(s)`);

  // Groups are independent (separate browser contexts, no shared mutable state) so scrape
  // them concurrently instead of one-after-another — halves wall-clock time for 2 groups.
  const results = await Promise.allSettled(groups.map((group) => processGroup(group)));

  for (const [index, result] of results.entries()) {
    if (result.status === "rejected") {
      console.error(`[scan] group ${groups[index].name} failed, continuing with others:`, result.reason);
    }
  }

  console.log(`[scan] cycle finished`);
}
