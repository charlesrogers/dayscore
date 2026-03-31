const DISCORD_API = "https://discord.com/api/v10";

function getHeaders() {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error("DISCORD_BOT_TOKEN not set");
  return {
    Authorization: `Bot ${token}`,
    "Content-Type": "application/json",
  };
}

export interface DiscordMessage {
  id: string;
  content: string;
  author: {
    id: string;
    bot?: boolean;
  };
  timestamp: string;
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = 2
): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    const res = await fetch(url, init);
    if (res.ok) return res;

    // Respect Discord rate limits
    if (res.status === 429) {
      const retryAfter = parseFloat(res.headers.get("Retry-After") || "1");
      console.log(`[Discord] Rate limited, retrying after ${retryAfter}s`);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      continue;
    }

    // Retry on server errors
    if (res.status >= 500 && i < retries) {
      console.log(`[Discord] Server error ${res.status}, retry ${i + 1}/${retries}`);
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
      continue;
    }

    // Non-retryable error
    const text = await res.text();
    throw new Error(`Discord API failed (${res.status}): ${text}`);
  }
  throw new Error("Discord API: max retries exceeded");
}

export async function sendMessage(
  channelId: string,
  content: string
): Promise<DiscordMessage> {
  const res = await fetchWithRetry(
    `${DISCORD_API}/channels/${channelId}/messages`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    }
  );
  return res.json();
}

export async function getMessagesSince(
  channelId: string,
  afterMessageId: string
): Promise<DiscordMessage[]> {
  const res = await fetchWithRetry(
    `${DISCORD_API}/channels/${channelId}/messages?after=${afterMessageId}&limit=100`,
    { headers: getHeaders() }
  );
  const messages: DiscordMessage[] = await res.json();
  // Discord returns newest first, reverse to chronological order
  return messages.reverse();
}
