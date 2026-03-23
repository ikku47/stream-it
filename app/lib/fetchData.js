// lib/fetchData.js
const isTauri = typeof window !== 'undefined' && window.__TAURI_INTERNALS__;

export const fetchData = async (url, options = {}) => {
  if (isTauri) {
    try {
      // Use dynamic import for Tauri plugins so the web version doesn't crash during build
      const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http');
      
      const response = await tauriFetch(url, {
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Referer': 'https://moflix-stream.xyz/',
          ...options.headers
        },
        body: options.body
      });
      
      if (!response.ok) throw new Error(`Status ${response.status}`);
      return await response.json();
    } catch (e) {
      console.error("Tauri Native Fetch Error:", e);
      // Fallback if plugin fails
    }
  }

  // Web fallback (using our Next.js API proxy)
  const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxyUrl, options);
  if (!res.ok) throw new Error(`Fetch Error: ${res.status}`);
  return res.json();
};
