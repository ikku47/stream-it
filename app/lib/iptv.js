// lib/iptv.js — IPTV-org playlist utilities

export const IPTV_URL = 'https://iptv-org.github.io/iptv/index.m3u';

/**
 * Parse an M3U playlist string into an array of channel objects.
 */
export function parseM3U(text) {
  const lines = text.split('\n');
  const channels = [];
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF:')) {
      current = {
        id: '',
        name: '',
        logo: '',
        group: '',
        url: '',
      };

      // Extract name (after last comma)
      const commaIdx = line.lastIndexOf(',');
      if (commaIdx !== -1) {
        current.name = line.slice(commaIdx + 1).trim();
      }

      // Extract tvg-id
      const idMatch = line.match(/tvg-id="([^"]*)"/);
      current.id = idMatch ? idMatch[1] : '';

      // Extract tvg-logo
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      current.logo = logoMatch ? logoMatch[1] : '';

      // Extract group-title
      const groupMatch = line.match(/group-title="([^"]*)"/);
      current.group = groupMatch ? groupMatch[1] : 'Undefined';
    } else if (line && !line.startsWith('#') && current) {
      current.url = line;
      if (current.name && current.url) {
        channels.push(current);
      }
      current = null;
    }
  }

  return channels;
}

/**
 * Get a deduplicated sorted list of groups from channels.
 */
export function getGroups(channels) {
  const raw = [...new Set(channels.map((c) => c.group))];
  // Split multi-group entries (e.g. "News;Sports") and flatten + deduplicate
  const allGroups = new Set();
  allGroups.add('All');
  for (const g of raw) {
    if (g === 'Undefined') continue;
    g.split(';').forEach((part) => {
      const t = part.trim();
      if (t) allGroups.add(t);
    });
  }
  // Sort alphabetically, with 'All' first
  return ['All', ...[...allGroups].filter((g) => g !== 'All').sort()];
}

/**
 * Filter channels by group and optional search query.
 */
export function filterChannels(channels, group, query = '') {
  let result = channels;

  if (group && group !== 'All') {
    result = result.filter((c) => c.group.split(';').map(s => s.trim()).includes(group));
  }

  if (query.trim()) {
    const q = query.toLowerCase();
    result = result.filter((c) => c.name.toLowerCase().includes(q));
  }

  return result;
}

/**
 * Group icon / emoji map for common categories.
 */
export const GROUP_ICONS = {
  All: '📺',
  News: '📰',
  Sports: '⚽',
  Movies: '🎬',
  Entertainment: '🌟',
  Music: '🎵',
  Kids: '🧸',
  Documentary: '🎥',
  Animation: '🎨',
  Comedy: '😂',
  Cooking: '🍳',
  Travel: '✈️',
  Nature: '🌿',
  Science: '🔬',
  Business: '💼',
  Religious: '⛪',
  General: '📡',
  Lifestyle: '🌸',
  Education: '📚',
  Culture: '🏛️',
  Auto: '🚗',
  Series: '📟',
  Classic: '🎞️',
  Weather: '🌤️',
  Family: '👨‍👩‍👧',
  Outdoor: '🏕️',
  Legislative: '🏛️',
  Shop: '🛍️',
  Relax: '😌',
  Public: '📢',
  Undefined: '❓',
};

export function getGroupIcon(group) {
  return GROUP_ICONS[group] ?? '📺';
}
