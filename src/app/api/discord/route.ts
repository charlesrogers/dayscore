import { InteractionType, InteractionResponseType, verifyKey } from "discord-interactions";
import { updateJournal } from "@/lib/db";

export async function POST(request: Request) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!publicKey) {
    return Response.json({ error: "No public key configured" }, { status: 500 });
  }

  // Verify the request signature
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  const body = await request.text();

  if (!signature || !timestamp) {
    return Response.json({ error: "Missing signature" }, { status: 401 });
  }

  const isValid = await verifyKey(body, signature, timestamp, publicKey);
  if (!isValid) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const interaction = JSON.parse(body);

  // Handle Discord ping (verification)
  if (interaction.type === InteractionType.PING) {
    return Response.json({ type: InteractionResponseType.PONG });
  }

  // Handle button click -> open modal
  if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
    if (interaction.data.custom_id === "open_journal") {
      const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "America/Denver",
      });
      return Response.json({
        type: InteractionResponseType.MODAL,
        data: {
          custom_id: `journal_submit_${today}`,
          title: `Journal for ${today}`,
          components: [
            {
              type: 1, // Action Row
              components: [
                {
                  type: 4, // Text Input
                  custom_id: "journal_text",
                  label: "Daily Journal",
                  style: 2, // Paragraph
                  placeholder: "How was your day?",
                  required: true,
                },
              ],
            },
          ],
        },
      });
    }
  }

  // Handle modal submission
  if (interaction.type === InteractionType.MODAL_SUBMIT) {
    const customId = interaction.data.custom_id as string;
    if (customId.startsWith("journal_submit_")) {
      const date = customId.replace("journal_submit_", "");
      const journalText = interaction.data.components[0].components[0].value;

      await updateJournal(date, journalText);

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dayscore.vercel.app";
      return Response.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Journal saved for ${date}! [View Dashboard](${appUrl})`,
          flags: 64, // Ephemeral - only visible to the user
        },
      });
    }
  }

  return Response.json({ error: "Unknown interaction" }, { status: 400 });
}
