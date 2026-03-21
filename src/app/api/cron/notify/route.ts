import { initDb, getNightcapIndex } from "@/lib/db";
import { sendMessage } from "@/lib/discord";
import { createConversation, getActiveConversation } from "@/lib/conversation";
import { getQuestionsForType } from "@/lib/questions";
import { ConversationType } from "@/lib/types";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "true";
  const type = (searchParams.get("type") || "personal") as ConversationType;

  // Time guard per type
  if (!force) {
    const now = new Date();
    const mtHour = parseInt(
      now.toLocaleString("en-US", { timeZone: "America/Denver", hour: "numeric", hour12: false }),
      10
    );
    const mtMinute = parseInt(
      now.toLocaleString("en-US", { timeZone: "America/Denver", minute: "numeric" }),
      10
    );
    const mtDay = parseInt(
      now.toLocaleString("en-US", { timeZone: "America/Denver", weekday: "short" }).slice(0, 3),
      10
    );
    const mtDayName = now.toLocaleString("en-US", { timeZone: "America/Denver", weekday: "short" });

    // Schedule: morning=7am, work=5pm, personal=9pm, nightcap=10pm daily
    // week/month=Sun 9:30am, relationship=Sun 7pm
    const schedules: Record<string, { hour: number; minute?: number; dayOfWeek?: string }> = {
      morning: { hour: 7 },
      work: { hour: 17 },
      personal: { hour: 21 },
      nightcap: { hour: 22 },
      week: { hour: 9, minute: 30, dayOfWeek: "Sun" },
      month: { hour: 9, minute: 30, dayOfWeek: "Sun" },
      relationship: { hour: 19, dayOfWeek: "Sun" },
    };

    const sched = schedules[type];
    if (sched) {
      if (sched.dayOfWeek && mtDayName !== sched.dayOfWeek) {
        return Response.json({ skipped: true, reason: `Not ${sched.dayOfWeek} for ${type}` });
      }
      if (mtHour !== sched.hour) {
        return Response.json({ skipped: true, reason: `Not ${sched.hour}:${String(sched.minute ?? 0).padStart(2, "0")} MT for ${type}` });
      }
      if (sched.minute !== undefined && Math.abs(mtMinute - sched.minute) > 5) {
        return Response.json({ skipped: true, reason: `Not ${sched.hour}:${String(sched.minute).padStart(2, "0")} MT for ${type}` });
      }
    }
  }

  const channelId = process.env.DISCORD_CHANNEL_ID;
  if (!channelId) {
    return Response.json({ error: "No channel ID configured" }, { status: 500 });
  }

  await initDb();

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Denver",
  });

  // Check if there's already an active conversation of this type
  const existing = await getActiveConversation(today, type);
  if (existing) {
    return Response.json({ skipped: true, reason: `${type} conversation already active` });
  }

  let nightcapIndex: number | undefined;
  if (type === "nightcap") {
    nightcapIndex = await getNightcapIndex();
  }

  const questions = getQuestionsForType(type, nightcapIndex);
  const firstQuestion = questions[0];
  let greeting: string;
  if (type === "nightcap") {
    greeting = `Nightcap time! 🌙\n\n**${firstQuestion.text}**`;
  } else if (type === "work") {
    greeting = `Hey Charles, work check-in for ${today}.\n\n**${firstQuestion.text}**`;
  } else {
    greeting = `Hey Charles, let's check in for ${today}.\n\n**${firstQuestion.text}**`;
  }

  const msg = await sendMessage(channelId, greeting);
  await createConversation(today, channelId, firstQuestion.id, msg.id, type);

  return Response.json({ ok: true, date: today, type, questionId: firstQuestion.id });
}
