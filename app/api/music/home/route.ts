import { NextResponse } from "next/server";
import { getMusicHomeDataCached } from "@/lib/music-server";

export const revalidate = 300;

export async function GET() {
  try {
    const data = await getMusicHomeDataCached();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Music home error:", error);
    return NextResponse.json({ error: "Unable to load music shelves right now." }, { status: 500 });
  }
}
