import { NextResponse } from "next/server";

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");
  if (!targetUrl || !targetUrl.includes("moflix-stream.xyz")) {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  const r = await fetch(targetUrl, {
    headers: {
      "User-Agent": DEFAULT_USER_AGENT,
      Accept: "application/json",
      Referer: "https://moflix-stream.xyz/"
    }
  });

  if (!r.ok) {
    return NextResponse.json({ error: "Upstream request failed" }, { status: 502 });
  }

  return NextResponse.json(await r.json());
}
