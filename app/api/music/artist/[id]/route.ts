import { NextResponse } from "next/server";
import { getArtistDetailCached } from "@/lib/music-server";

export const revalidate = 600;

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const data = await getArtistDetailCached(params.id);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=120, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Artist detail error:", error);
    return NextResponse.json({ error: "Unable to load artist details." }, { status: 500 });
  }
}
