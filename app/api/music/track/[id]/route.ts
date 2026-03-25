import { NextResponse } from "next/server";
import { getTrackDetailCached } from "@/lib/music-server";

export const revalidate = 600;

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const data = await getTrackDetailCached(params.id);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=120, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Track detail error:", error);
    return NextResponse.json({ error: "Unable to load track details." }, { status: 500 });
  }
}
