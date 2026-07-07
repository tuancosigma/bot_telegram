import { config as loadDotenv } from "dotenv";
import { z } from "zod";

loadDotenv();

const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1, "TELEGRAM_BOT_TOKEN is required — see docs/telegram-bot-setup.md"),
  TELEGRAM_CHAT_ID: z
    .string()
    .min(1, "TELEGRAM_CHAT_ID is required — see docs/telegram-bot-setup.md")
    .transform((val) => val.split(",").map((s) => s.trim()).filter(Boolean)),
  AI_API_KEY: z.string().min(1, "AI_API_KEY is required"),
  AI_BASE_URL: z.string().url().default("https://api.deepseek.com/v1"),
  AI_MODEL: z.string().min(1).default("deepseek-chat"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}\n\nCopy .env.example to .env and fill in the values.`);
}

export const env = parsed.data;
