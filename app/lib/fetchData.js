// lib/fetchData.js
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';

const isTauri = typeof window !== 'undefined' && window.__TAURI_INTERNALS__;

export const fetchData = async (url, options = {}) => {
  if (isTauri) {
    try {
      const response = await tauriFetch(url, {
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Referer': 'https://moflix-stream.xyz/',
          ...options.headers
        },
        body: options.body
      });
      
      // Tauri 2 fetch returns a Response object similar to web fetch
      if (!response.ok) throw new Error(`Status ${response.status}`);
      return await response.json();
    } catch (e) {
      console.error("Tauri Fetch Error:", e);
      throw e;
    }
  }

  // Web fallback (using our Next.js API proxy)
  const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxyUrl, options);
  if (!res.ok) throw new Error(`Proxy Fetch Error: ${res.status}`);
  return res.json();
};
