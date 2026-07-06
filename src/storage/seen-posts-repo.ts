import { getDb } from "./db";

export function isSeen(postUrl: string): boolean {
  const row = getDb().prepare("SELECT 1 FROM seen_posts WHERE post_url = ?").get(postUrl);
  return row !== undefined;
}

export function markSeen(postUrl: string, groupName: string): void {
  getDb()
    .prepare("INSERT OR IGNORE INTO seen_posts (post_url, group_name) VALUES (?, ?)")
    .run(postUrl, groupName);
}
