import { NextResponse } from "next/server";

export async function GET(request) {
   throw new Error("Custom error message");
  // return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
