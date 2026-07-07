import TelegramBot from "node-telegram-bot-api";
import { env } from "../config/env";

const MEDIA_GROUP_CHUNK_SIZE = 10;

let botInstance: TelegramBot | null = null;

function getBot(): TelegramBot {
  if (!botInstance) {
    botInstance = new TelegramBot(env.TELEGRAM_BOT_TOKEN, { polling: false });
  }
  return botInstance;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function sendDealMessage(text: string, imageUrls: string[]): Promise<void> {
  const bot = getBot();

  for (const chatId of env.TELEGRAM_CHAT_ID) {
    try {
      await bot.sendMessage(chatId, text, { parse_mode: "Markdown" });

      if (imageUrls.length === 0) continue;

      if (imageUrls.length === 1) {
        await bot.sendPhoto(chatId, imageUrls[0]);
        continue;
      }

      for (const batch of chunk(imageUrls, MEDIA_GROUP_CHUNK_SIZE)) {
        await bot.sendMediaGroup(
          chatId,
          batch.map((url) => ({ type: "photo", media: url }))
        );
      }
    } catch (error) {
      console.error(`[Telegram] Failed to send message to chat ID ${chatId}:`, error);
    }
  }
}
