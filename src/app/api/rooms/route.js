import { NextResponse } from "next/server";
import { v4 } from "uuid";

let rooms = [];

export async function GET() {
  return NextResponse.json(
    { rooms },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function POST(req) {
  const uuidV4 = v4();
  const { roomName } = await req.json();

  const room = {
    id: uuidV4,
    name: roomName,
    timeStamp: new Date(),
  };
  rooms.push(room);
  return NextResponse.json(
    { room },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
