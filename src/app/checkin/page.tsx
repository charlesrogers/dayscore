import { ChatFlow } from "@/components/chat-flow";

export default async function CheckinPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Denver",
  });
  const date = params.date || today;

  return <ChatFlow date={date} />;
}
