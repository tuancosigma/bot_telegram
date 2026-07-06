import { loadGroups } from "../config/groups";
import { scrapeGroup } from "../scraper/fb-group-scraper";
import { isMiniPcPost } from "../filter/minipc-keyword-filter";
import { isSeen, markSeen } from "../storage/seen-posts-repo";
import { extractPostSpec } from "../ai/post-spec-extractor";
import { computePricing } from "../ai/pricing-rules";
import { evaluateDeal } from "../ai/deal-evaluator";
import { formatDealMessage } from "../telegram/message-formatter";
import { sendDealMessage } from "../telegram/telegram-sender";

async function processGroup(group: { name: string; url: string }): Promise<void> {
  console.log(`[scan] scraping ${group.name}...`);
  const posts = await scrapeGroup(group.url, group.name);
  console.log(`[scan] ${group.name}: found ${posts.length} posts`);

  let sentCount = 0;
  for (const post of posts) {
    if (isSeen(post.url)) continue;
    if (!isMiniPcPost(post.textContent)) {
      markSeen(post.url, post.groupName);
      continue;
    }

    try {
      const spec = await extractPostSpec(post.textContent);
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

  for (const group of groups) {
    try {
      await processGroup(group);
    } catch (error) {
      console.error(`[scan] group ${group.name} failed, continuing with others:`, error);
    }
  }

  console.log(`[scan] cycle finished`);
}
