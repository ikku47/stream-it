import { NextResponse } from "next/server";
import { getPlaylistDetailCached } from "@/lib/music-server";

export const revalidate = 600;

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const data = await getPlaylistDetailCached(params.id);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=120, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Playlist detail error:", error);
    return NextResponse.json({ error: "Unable to load playlist details." }, { status: 500 });
  }
}
