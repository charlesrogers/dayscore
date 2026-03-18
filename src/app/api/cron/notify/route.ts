export async function GET(request: Request) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only send if it's actually 5pm Mountain Time
  const mtHour = parseInt(
    new Date().toLocaleString("en-US", {
      timeZone: "America/Denver",
      hour: "numeric",
      hour12: false,
    }),
    10
  );
  if (mtHour !== 17) {
    return Response.json({ skipped: true, reason: "Not 5pm MT" });
  }

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Denver",
  });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dayscore.vercel.app";
  const checkinUrl = `${appUrl}/checkin?date=${today}`;
  const dashUrl = appUrl;

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return Response.json({ error: "No webhook URL configured" }, { status: 500 });
  }

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `**Time to check in!**\n${checkinUrl}\nDashboard: ${dashUrl}`,
    }),
  });

  return Response.json({ ok: true, date: today });
}
