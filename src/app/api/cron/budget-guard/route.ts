const FLY_API = "https://api.fly.io/graphql";
// Expected: ~$1.94/month = ~$0.065/day for 1 machine
// We check month-to-date spend vs expected spend for this day of month + $0.50 buffer
const MONTHLY_EXPECTED = 2.00; // dollars — 1 machine at $1.94 rounded up
const BUFFER = 0.50; // dollars — allowance above expected before killing
const EXPECTED_MACHINES = 1;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const flyToken = process.env.FLY_API_TOKEN;
  if (!flyToken) {
    return Response.json({ error: "No FLY_API_TOKEN" }, { status: 500 });
  }

  // 1. Check machine count — should be exactly 1
  const machinesRes = await fetch(
    "https://api.machines.dev/v1/apps/dayscore-bot/machines",
    { headers: { Authorization: `Bearer ${flyToken}` } }
  );
  const machines = await machinesRes.json();
  const runningMachines = Array.isArray(machines)
    ? machines.filter((m: { state: string }) => m.state === "started")
    : [];

  // 2. Check spend via GraphQL
  let spend = 0;
  try {
    const spendRes = await fetch(FLY_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${flyToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `{ organization(slug: "personal") { billable { monthTotal } } }`,
      }),
    });
    const spendData = await spendRes.json();
    spend = spendData?.data?.organization?.billable?.monthTotal ?? 0;
  } catch {
    // GraphQL might not work with deploy tokens — that's OK, machine count check is primary
  }

  const alerts: string[] = [];

  // 3. Check for unexpected machines
  if (runningMachines.length > EXPECTED_MACHINES) {
    alerts.push(
      `DANGER: ${runningMachines.length} running machines (expected ${EXPECTED_MACHINES}). Stopping extras.`
    );

    // Stop extra machines (keep the first one)
    const extras = runningMachines.slice(EXPECTED_MACHINES);
    for (const machine of extras) {
      await fetch(
        `https://api.machines.dev/v1/apps/dayscore-bot/machines/${machine.id}/stop`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${flyToken}` },
        }
      );
    }
  }

  // 4. Check spend vs expected for this point in the month
  const dayOfMonth = new Date().getDate();
  const expectedSpend = (MONTHLY_EXPECTED / 30) * dayOfMonth;
  const killThreshold = expectedSpend + BUFFER;
  const warnThreshold = expectedSpend + BUFFER * 0.5;

  if (spend > killThreshold) {
    alerts.push(
      `BUDGET EXCEEDED: $${spend.toFixed(2)} spent (expected ~$${expectedSpend.toFixed(2)} by day ${dayOfMonth}, kill threshold $${killThreshold.toFixed(2)}). Stopping ALL machines.`
    );

    // Nuclear option — stop everything
    for (const machine of runningMachines) {
      await fetch(
        `https://api.machines.dev/v1/apps/dayscore-bot/machines/${machine.id}/stop`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${flyToken}` },
        }
      );
    }
  } else if (spend > warnThreshold) {
    alerts.push(`WARNING: Fly.io spend at $${spend.toFixed(2)} (expected ~$${expectedSpend.toFixed(2)} by day ${dayOfMonth})`);
  }

  // 5. Alert on Discord if anything is wrong
  if (alerts.length > 0) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `**DayScore Budget Guard**\n${alerts.join("\n")}`,
        }),
      });
    }
  }

  return Response.json({
    ok: true,
    spend,
    runningMachines: runningMachines.length,
    alerts,
  });
}
