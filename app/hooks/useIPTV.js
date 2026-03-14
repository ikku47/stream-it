'use client';
// hooks/useIPTV.js
import { useState, useEffect, useRef, useMemo } from 'react';
import { parseM3U, getGroups, filterChannels, IPTV_URL } from '../lib/iptv';

const CACHE_KEY = 'iptv_channels_cache';
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

function getCached() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function setCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
}

export function useIPTV() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cached = getCached();
    if (cached) {
      setChannels(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(IPTV_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => {
        // Handle both \n and \r\n line endings
        const normalizedText = text.replace(/\r\n/g, '\n');
        const parsed = parseM3U(normalizedText);
        setCache(parsed);
        setChannels(parsed);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

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
