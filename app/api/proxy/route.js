import { NextResponse } from "next/server";

const FORWARDED_REQUEST_HEADERS = [
  "accept",
  "authorization",
  "content-type",
  "origin",
  "referer",
  "x-goog-visitor-id",
];

const FORWARDED_RESPONSE_HEADERS = [
  "cache-control",
  "content-type",
  "etag",
  "expires",
  "last-modified",
];

function getTargetUrl(request) {
  const { searchParams } = new URL(request.url);
  return searchParams.get("url");
}

function buildTargetHeaders(request) {
  const headers = new Headers();

  FORWARDED_REQUEST_HEADERS.forEach((header) => {
    const value = request.headers.get(header);
    if (value) headers.set(header, value);
  });

  if (!headers.has("accept")) {
    headers.set("accept", "*/*");
  }

  if (!headers.has("user-agent")) {
    headers.set(
      "user-agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    );
  }

  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    headers.set("accept-language", acceptLanguage);
  }

  return headers;
}

function buildResponseHeaders(response) {
  const headers = new Headers();

  FORWARDED_RESPONSE_HEADERS.forEach((header) => {
    const value = response.headers.get(header);
    if (value) headers.set(header, value);
  });

  return headers;
}

async function proxy(request) {
  const targetUrl = getTargetUrl(request);

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const parsedUrl = new URL(targetUrl);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "Unsupported target protocol" }, { status: 400 });
    }

    const method = request.method.toUpperCase();
    const body =
      method === "GET" || method === "HEAD" ? undefined : new Uint8Array(await request.arrayBuffer());

    const response = await fetch(parsedUrl, {
      method,
      headers: buildTargetHeaders(request),
      body,
      redirect: "follow",
    });

    return new NextResponse(await response.arrayBuffer(), {
      status: response.status,
      headers: buildResponseHeaders(response),
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
