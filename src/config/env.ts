import { config as loadDotenv } from "dotenv";
import { z } from "zod";

loadDotenv();

const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1, "TELEGRAM_BOT_TOKEN is required — see docs/telegram-bot-setup.md"),
  TELEGRAM_CHAT_ID: z.string().min(1, "TELEGRAM_CHAT_ID is required — see docs/telegram-bot-setup.md"),
  DEEPSEEK_API_KEY: z.string().min(1, "DEEPSEEK_API_KEY is required — get one at https://platform.deepseek.com"),
  DEEPSEEK_BASE_URL: z.string().url().default("https://api.deepseek.com"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}\n\nCopy .env.example to .env and fill in the values.`);
}

export const env = parsed.data;
