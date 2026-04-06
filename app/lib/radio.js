// lib/radio.js — Radio-browser API utilities

export const RADIO_API_BASE = "https://de1.api.radio-browser.info/json";

/**
 * Internal cache helper using sessionStorage.
 */
async function fetchWithCache(url, expiry = 3600000) { // Default 1 hour
  if (typeof window === "undefined") {
    try {
      const res = await fetch(url);
      return res.ok ? res.json() : [];
    } catch { return []; }
  }
  
  const cacheKey = `radio_cache_${url}`;
  
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < expiry) return data;
    }
  } catch (e) {
    console.warn("Radio Cache Read Error:", e);
  }
  
  let data = [];
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    data = await res.json();
    
    // Attempt to cache
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (quotaError) {
      if (quotaError.name === 'QuotaExceededError' || quotaError.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        console.warn("Radio Cache Storage Quota Exceeded. Clearing old radio cache keys...");
        // Clear all keys starting with radio_cache_ to free space
        const keysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith('radio_cache_')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => sessionStorage.removeItem(k));
        
        // Try saving one last time after clearing
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
        } catch (retryError) {
          console.error("Radio Cache: Failed to cache even after clearing space. Data size might be too large for storage.");
        }
      }
    }
    
    return data;
  } catch (err) {
    console.error("Radio Cache Fetch Error:", err);
    return data.length > 0 ? data : [];
  }
}

/**
 * Fetch top radio stations.
 */
export async function getTopRadioStations(limit = 1000, offset = 0) {
  const url = `${RADIO_API_BASE}/stations?order=votes&reverse=true&offset=${offset}&limit=${limit}&lastcheckok=1`;
  const data = await fetchWithCache(url);
  return formatStations(data);
}

/**
 * Fetch trending radio stations (by click count).
 */
export async function getTrendingRadioStations(limit = 1000, offset = 0) {
  const url = `${RADIO_API_BASE}/stations?order=clickcount&reverse=true&offset=${offset}&limit=${limit}&lastcheckok=1`;
  const data = await fetchWithCache(url);
  return formatStations(data);
}

/**
 * Search for radio stations by name.
 */
export async function searchRadioStations(query, limit = 1000, offset = 0) {
  const url = `${RADIO_API_BASE}/stations/byname/${encodeURIComponent(query)}?order=votes&reverse=true&offset=${offset}&limit=${limit}&lastcheckok=1`;
  const data = await fetchWithCache(url, 300000); // 5 min cache for search
  return formatStations(data);
}

/**
 * Get all available countries.
 */
export async function getRadioCountries() {
  const url = `${RADIO_API_BASE}/countries?order=stationcount&reverse=true`;
  return await fetchWithCache(url, 86400000); // 24 hour cache for static categories
}

/**
 * Get all available languages.
 */
export async function getRadioLanguages() {
  const url = `${RADIO_API_BASE}/languages?order=stationcount&reverse=true&limit=1000`;
  return await fetchWithCache(url, 86400000);
}

/**
 * Get popular tags.
 */
export async function getRadioTags() {
  const url = `${RADIO_API_BASE}/tags?order=stationcount&reverse=true&limit=1000`;
  return await fetchWithCache(url, 86400000);
}

/**
 * Get stations by country.
 */
export async function getStationsByCountry(countryCode, limit = 1000, offset = 0) {
  const url = `${RADIO_API_BASE}/stations/bycountrycodeexact/${countryCode}?order=votes&reverse=true&offset=${offset}&limit=${limit}&lastcheckok=1`;
  const data = await fetchWithCache(url);
  return formatStations(data);
}

/**
 * Get stations by tag.
 */
export async function getStationsByTag(tag, limit = 1000, offset = 0) {
  const url = `${RADIO_API_BASE}/stations/bytag/${encodeURIComponent(tag)}?order=votes&reverse=true&offset=${offset}&limit=${limit}&lastcheckok=1`;
  const data = await fetchWithCache(url);
  return formatStations(data);
}

/**
 * Get stations by language.
 */
export async function getStationsByLanguage(lang, limit = 1000, offset = 0) {
  const url = `${RADIO_API_BASE}/stations/bylanguage/${encodeURIComponent(lang)}?order=votes&reverse=true&offset=${offset}&limit=${limit}&lastcheckok=1`;
  const data = await fetchWithCache(url);
  return formatStations(data);
}

function formatStations(data) {
  if (!Array.isArray(data)) return [];
  return data.map(station => ({
    id: station.stationuuid,
    name: (station.name || '').trim(),
    url: station.url_resolved || station.url,
    homepage: station.homepage,
    favicon: station.favicon,
    tags: station.tags,
    country: station.country,
    countryCode: station.countrycode,
    language: station.language,
    codec: station.codec,
    bitrate: station.bitrate,
    votes: station.votes,
    clicks: station.clickcount,
    lastCheckOk: station.lastcheckok,
    type: 'radio'
  }));
}
