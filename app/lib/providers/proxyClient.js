/**
 * Calls the server-side extractor to resolve a provider page/API URL to a direct stream.
 */
export async function fetchProxyVideo(targetUrl, meta = {}) {
  const params = new URLSearchParams();
  params.set("url", targetUrl);
  params.set("type", meta.type || "movie");
  params.set("season", String(meta.season ?? 1));
  params.set("episode", String(meta.episode ?? 1));
  params.set("tmdbId", String(meta.tmdbId ?? ""));
  params.set("imdbId", meta.imdbId ?? "");
  params.set("title", meta.title ?? "");
  params.set("year", meta.year ?? "");
  if (meta.lang) params.set("lang", meta.lang);

  const res = await fetch(`/api/proxy?${params.toString()}`);
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(typeof data.error === "string" ? data.error : "Proxy extraction failed");
  }
  return data;
}
