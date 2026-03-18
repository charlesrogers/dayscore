import { Client, GatewayIntentBits } from "discord.js";

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const API_URL = process.env.DAYSCORE_API_URL || "https://dayscore-five.vercel.app";
const CRON_SECRET = process.env.CRON_SECRET;

if (!BOT_TOKEN || !CHANNEL_ID || !CRON_SECRET) {
  console.error("Missing env vars: DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID, CRON_SECRET");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`[DayScore Bot] Logged in as ${client.user.tag}`);
  console.log(`[DayScore Bot] Watching channel ${CHANNEL_ID}`);
});

const authHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${CRON_SECRET}`,
};

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channelId !== CHANNEL_ID) return;

  const text = message.content.trim().toLowerCase();
  console.log(`[DayScore Bot] Message from ${message.author.username}: ${message.content}`);

  try {
    // Command: !checkin — start personal check-in
    if (text === "!checkin") {
      const res = await fetch(`${API_URL}/api/start-checkin?type=personal`, {
        method: "POST",
        headers: authHeaders,
      });
      const data = await res.json();
      console.log(`[DayScore Bot] !checkin response:`, data);
      return;
    }

    // Command: !work — start work check-in
    if (text === "!work") {
      const res = await fetch(`${API_URL}/api/start-checkin?type=work`, {
        method: "POST",
        headers: authHeaders,
      });
      const data = await res.json();
      console.log(`[DayScore Bot] !work response:`, data);
      return;
    }

    // Command: stop — dismiss active conversation
    if (text === "stop") {
      const res = await fetch(`${API_URL}/api/stop-checkin`, {
        method: "POST",
        headers: authHeaders,
      });
      const data = await res.json();
      console.log(`[DayScore Bot] stop response:`, data);
      return;
    }

    // Regular message — relay to discord-reply for conversation processing
    const res = await fetch(`${API_URL}/api/discord-reply`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        content: message.content,
        authorId: message.author.id,
        messageId: message.id,
      }),
    });

    const data = await res.json();
    console.log(`[DayScore Bot] API response:`, data);
  } catch (err) {
    console.error(`[DayScore Bot] Error calling API:`, err);
  }
});

client.login(BOT_TOKEN);
