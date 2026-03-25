import { NextResponse } from "next/server";
import "@/lib/youtubeEval";
import { Innertube } from "youtubei.js";

export const runtime = "nodejs";

let tubePromise: Promise<Innertube> | null = null;

function getClient() {
  if (!tubePromise) {
    const cookie = process.env.YT_COOKIE || process.env.YOUTUBE_COOKIE;
    const visitorData = process.env.YT_VISITOR_DATA || process.env.YOUTUBE_VISITOR_DATA;
    const poToken = process.env.YT_PO_TOKEN || process.env.YOUTUBE_PO_TOKEN;

    tubePromise = Innertube.create({
      lang: "en",
      location: "US",
      retrieve_player: true,
      cookie,
      visitor_data: visitorData,
      po_token: poToken,
    });
  }

  return tubePromise;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter." }, { status: 400 });
  }

  try {
    const yt = await getClient();
    let info;
    const infoClients = ["YTMUSIC_ANDROID", "YTMUSIC", "ANDROID"] as const;

    for (const client of infoClients) {
      try {
        info = await yt.music.getInfo(id, { client });
        break;
      } catch {
        // try next client
      }
    }

    if (!info) {
      info = await yt.getInfo(id, { client: "ANDROID" });
    }

    let format;
    try {
      format = info.chooseFormat({ type: "audio", quality: "best", format: "any" });
    } catch {
      format = info.streaming_data?.adaptive_formats?.find((fmt) => fmt.has_audio && !fmt.has_video);
    }

    if (!format) {
      return NextResponse.json({ error: "No playable audio format found." }, { status: 404 });
    }

    const rangeHeader = request.headers.get("range");
    const contentLength = Number(format.content_length || 0);
    let range;

    if (rangeHeader && contentLength) {
      const match = /bytes=(\d+)-(\d+)?/.exec(rangeHeader);
      if (match) {
        const start = Number(match[1]);
        const end = match[2] ? Number(match[2]) : Math.min(start + 1024 * 1024, contentLength - 1);
        range = { start, end };
      }
    }

    const decipheredUrl = await format.decipher(info.actions.session.player);
    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      "Origin": "https://www.youtube.com",
      "Referer": "https://www.youtube.com/",
      "Accept": "*/*",
    };

    if (range) {
      headers.Range = `bytes=${range.start}-${range.end}`;
    }

    const upstream = await fetch(decipheredUrl, { headers });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "Upstream audio fetch failed." }, { status: upstream.status });
    }

    const stream = upstream.body;
    const mimeType = format.mime_type?.split(";")[0] || upstream.headers.get("content-type") || "audio/mp4";
    headers["Content-Type"] = mimeType;
    headers["Cache-Control"] = "no-store";
    headers["Accept-Ranges"] = "bytes";

    if (range && contentLength) {
      headers["Content-Range"] = `bytes ${range.start}-${range.end}/${contentLength}`;
      headers["Content-Length"] = String(range.end - range.start + 1);
    } else if (contentLength) {
      headers["Content-Length"] = String(contentLength);
    }

    return new Response(stream, { status: range ? 206 : 200, headers });
  } catch (error) {
    console.error("Music stream error:", error);
    return NextResponse.json({ error: "Unable to stream this track." }, { status: 500 });
  }
}
