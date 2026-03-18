import { getCheckin, getCheckins, upsertCheckin } from "@/lib/db";
import { CheckInInput } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const limit = searchParams.get("limit");

  if (date) {
    const checkin = await getCheckin(date);
    return Response.json(checkin);
  }

  const checkins = await getCheckins(limit ? parseInt(limit, 10) : 90);
  return Response.json(checkins);
}

export async function POST(request: Request) {
  const body = (await request.json()) as CheckInInput;

  if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return Response.json({ error: "Invalid date format" }, { status: 400 });
  }

  const checkin = await upsertCheckin(body);
  return Response.json(checkin);
}
