import { NextResponse } from "next/server";
import { getAlbumDetailCached } from "@/lib/music-server";

export const revalidate = 600;

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const data = await getAlbumDetailCached(params.id);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=120, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Album detail error:", error);
    return NextResponse.json({ error: "Unable to load album details." }, { status: 500 });
  }
}
