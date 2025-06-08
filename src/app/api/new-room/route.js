import { NextResponse } from "next/server";
import { v4 } from "uuid";

export async function GET(request) {
  const uuidV4 = v4();
  return NextResponse.json({ uuidV4: uuidV4 }, { status: 200 });
}
