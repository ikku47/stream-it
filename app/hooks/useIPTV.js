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
  try {
    sessionStorage.setItem(`iptv_cache_${providerId}`, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
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
