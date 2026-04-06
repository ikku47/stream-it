'use client';
// hooks/useIPTV.js
import { useState, useEffect, useRef, useMemo } from 'react';
import { parseM3U, getGroups, filterChannels, getIPTVProvider } from '../lib/iptv';
import useStore from '../store/useStore';

const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

function getCached(providerId) {
  try {
    const raw = sessionStorage.getItem(`iptv_cache_${providerId}`);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function setCache(providerId, data) {
  const cacheKey = `iptv_cache_${providerId}`;
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data }));
  } catch (quotaError) {
    if (quotaError.name === 'QuotaExceededError' || quotaError.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.warn("IPTV Cache Storage Quota Exceeded. Clearing old IPTV cache keys...");
      const keysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('iptv_cache_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => sessionStorage.removeItem(k));
      
      // Try saving again after clearing
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data }));
      } catch (retryError) {
        console.error("IPTV Cache: Failed to cache even after clearing space. M3U list might be too large for storage.");
      }
    }
  }
}

export function useIPTV() {
  const { iptvProviderId } = useStore();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const provider = getIPTVProvider(iptvProviderId);
    const cached = getCached(iptvProviderId);
    
    if (cached) {
      setChannels(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(provider.url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => {
        // Handle both \n and \r\n line endings
        const normalizedText = text.replace(/\r\n/g, '\n');
        const parsed = parseM3U(normalizedText);
        setCache(iptvProviderId, parsed);
        setChannels(parsed);
        setLoading(false);
        setError(null);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
        setChannels([]);
      });
  }, [iptvProviderId]);

  return { channels, loading, error };
}

export function useIPTVFiltered(channels, group, query) {
  return useMemo(
    () => filterChannels(channels, group, query),
    [channels, group, query]
  );
}

export function useIPTVGroups(channels) {
  return useMemo(() => getGroups(channels), [channels]);
}
