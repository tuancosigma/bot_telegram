import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const DB_PATH = join(process.cwd(), "data", "bot.db");

function ensureDataDir(): void {
  const dir = dirname(DB_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;

  ensureDataDir();
  dbInstance = new Database(DB_PATH);
  dbInstance.pragma("journal_mode = WAL");

  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS seen_posts (
      post_url TEXT PRIMARY KEY,
      group_name TEXT NOT NULL,
      first_seen_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  return dbInstance;
}
