/**
 * Calls the server-side extractor to resolve a provider page/API URL to a direct stream.
 */
export async function fetchProxyVideo(targetUrl, meta = {}) {
  // Construct the combined URL with parameters
  const combined = new URL(targetUrl);
  combined.searchParams.set("type", meta.type || "movie");
  combined.searchParams.set("season", String(meta.season ?? 1));
  combined.searchParams.set("episode", String(meta.episode ?? 1));
  combined.searchParams.set("tmdbId", String(meta.tmdbId ?? ""));
  combined.searchParams.set("imdbId", meta.imdbId ?? "");
  combined.searchParams.set("title", meta.title ?? "");
  combined.searchParams.set("year", meta.year ?? "");
  if (meta.lang) combined.searchParams.set("lang", meta.lang);

  const params = new URLSearchParams();
  params.set("url", combined.toString());

  const res = await fetch(`/api/proxy?${params.toString()}`);
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(typeof data.error === "string" ? data.error : "Proxy extraction failed");
  }
  return data;
}

