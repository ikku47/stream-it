import { NextResponse } from "next/server";
import { searchMusicCached } from "@/lib/music-server";

export const revalidate = 180;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";

  if (query.length < 2) {
    return NextResponse.json({ error: "Search query must be at least 2 characters." }, { status: 400 });
  }

  try {
    const data = await searchMusicCached(query);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=180",
      },
    });
  } catch (error) {
    console.error("Music search error:", error);
    return NextResponse.json({ error: "Unable to search music right now." }, { status: 500 });
  }
}
