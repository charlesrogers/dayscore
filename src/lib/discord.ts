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

export async function sendMessage(
  channelId: string,
  content: string
): Promise<DiscordMessage> {
  const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord send failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function getMessagesSince(
  channelId: string,
  afterMessageId: string
): Promise<DiscordMessage[]> {
  const res = await fetch(
    `${DISCORD_API}/channels/${channelId}/messages?after=${afterMessageId}&limit=10`,
    { headers: getHeaders() }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord fetch failed (${res.status}): ${text}`);
  }
  const messages: DiscordMessage[] = await res.json();
  // Discord returns newest first, reverse to chronological order
  return messages.reverse();
}
