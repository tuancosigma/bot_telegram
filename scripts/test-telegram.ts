import { sendDealMessage } from "../src/telegram/telegram-sender";
import { env } from "../src/config/env";

async function main(): Promise<void> {
  console.log("Configured chat IDs:", env.TELEGRAM_CHAT_ID);
  console.log("Sending test message to all chat IDs...");

  const testMessage = `🤖 *Mini PC Deal Bot Test*
This is a test message to verify multiple Telegram Chat ID configurations.
If you see this, the bot successfully sent the message to this chat ID!`;

  // We send a text message and a simple public image to test
  await sendDealMessage(testMessage, [
    "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500"
  ]);

  console.log("Test execution finished.");
}

main().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});
