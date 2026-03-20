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

async function callApi(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error(`[DayScore Bot] Non-JSON response (${res.status}): ${text}`);
    return { error: text, status: res.status };
  }
}

async function dismissActive() {
  const data = await callApi(`${API_URL}/api/stop-checkin`, {
    method: "POST",
    headers: authHeaders,
  });
  if (data.dismissed) {
    console.log(`[DayScore Bot] Dismissed active conversation`);
  }
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channelId !== CHANNEL_ID) return;

  const text = message.content.trim().toLowerCase();
  console.log(`[DayScore Bot] Message from ${message.author.username}: ${message.content}`);

  try {
    // --- Commands that don't need to dismiss active conversations ---

    if (text === "!commands") {
      await message.channel.send(
        [
          "**DayScore Commands**",
          "`!checkin` — Start personal check-in",
          "`!work` — Start work check-in",
          "`!morning` — Start morning intention",
          "`!nightcap` — Start nightcap question",
          "`!week` — Start weekly review",
          "`!month` — Start monthly review",
          "`!relationship` — Start relationship review",
          "`!skip` — Skip current nightcap",
          "`!todo` / `!todo <task>` — Add a todo item",
          "`!log` / `!log <thought>` — Save a thought to your log",
          "`!commands` — Show this list",
          "`stop` — Dismiss active check-in",
        ].join("\n")
      );
      return;
    }

    if (text === "!skip") {
      const data = await callApi(`${API_URL}/api/skip-nightcap`, {
        method: "POST",
        headers: authHeaders,
      });
      console.log(`[DayScore Bot] !skip response:`, data);
      return;
    }

    if (text === "stop") {
      const data = await callApi(`${API_URL}/api/stop-checkin`, {
        method: "POST",
        headers: authHeaders,
      });
      console.log(`[DayScore Bot] stop response:`, data);
      return;
    }

    // --- Commands that dismiss any active conversation first ---

    if (text.startsWith("!todo")) {
      const inlineContent = message.content.trim().slice(5).trim();
      await dismissActive();
      if (inlineContent) {
        const data = await callApi(`${API_URL}/api/todo`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ content: inlineContent }),
        });
        console.log(`[DayScore Bot] !todo inline response:`, data);
      } else {
        const data = await callApi(`${API_URL}/api/start-checkin?type=todo`, {
          method: "POST",
          headers: authHeaders,
        });
        console.log(`[DayScore Bot] !todo prompted response:`, data);
      }
      return;
    }

    if (text.startsWith("!log")) {
      const inlineContent = message.content.trim().slice(4).trim();
      await dismissActive();
      if (inlineContent) {
        const data = await callApi(`${API_URL}/api/log`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ content: inlineContent }),
        });
        console.log(`[DayScore Bot] !log inline response:`, data);
      } else {
        const data = await callApi(`${API_URL}/api/start-checkin?type=log`, {
          method: "POST",
          headers: authHeaders,
        });
        console.log(`[DayScore Bot] !log prompted response:`, data);
      }
      return;
    }

    if (text === "!checkin") {
      await dismissActive();
      const data = await callApi(`${API_URL}/api/start-checkin?type=personal`, {
        method: "POST",
        headers: authHeaders,
      });
      console.log(`[DayScore Bot] !checkin response:`, data);
      return;
    }

    if (text === "!work") {
      await dismissActive();
      const data = await callApi(`${API_URL}/api/start-checkin?type=work`, {
        method: "POST",
        headers: authHeaders,
      });
      console.log(`[DayScore Bot] !work response:`, data);
      return;
    }

    if (text === "!week") {
      await dismissActive();
      const data = await callApi(`${API_URL}/api/start-checkin?type=week`, {
        method: "POST",
        headers: authHeaders,
      });
      console.log(`[DayScore Bot] !week response:`, data);
      return;
    }

    if (text === "!month") {
      await dismissActive();
      const data = await callApi(`${API_URL}/api/start-checkin?type=month`, {
        method: "POST",
        headers: authHeaders,
      });
      console.log(`[DayScore Bot] !month response:`, data);
      return;
    }

    if (text === "!relationship") {
      await dismissActive();
      const data = await callApi(`${API_URL}/api/start-checkin?type=relationship`, {
        method: "POST",
        headers: authHeaders,
      });
      console.log(`[DayScore Bot] !relationship response:`, data);
      return;
    }

    if (text === "!morning") {
      await dismissActive();
      const data = await callApi(`${API_URL}/api/start-checkin?type=morning`, {
        method: "POST",
        headers: authHeaders,
      });
      console.log(`[DayScore Bot] !morning response:`, data);
      return;
    }

    if (text === "!nightcap") {
      await dismissActive();
      const data = await callApi(`${API_URL}/api/start-checkin?type=nightcap`, {
        method: "POST",
        headers: authHeaders,
      });
      console.log(`[DayScore Bot] !nightcap response:`, data);
      return;
    }

    // Check for voice/audio attachment
    const audioAttachment = message.attachments.find(a =>
      a.contentType?.startsWith("audio/") || a.name?.endsWith(".ogg")
    );

    const data = await callApi(`${API_URL}/api/discord-reply`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        content: message.content,
        authorId: message.author.id,
        messageId: message.id,
        audioUrl: audioAttachment?.url || null,
      }),
    });

    console.log(`[DayScore Bot] API response:`, data);
  } catch (err) {
    console.error(`[DayScore Bot] Error calling API:`, err);
  }
});

client.login(BOT_TOKEN);
