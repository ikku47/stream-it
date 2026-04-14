// lib/iptv.js — IPTV-org playlist utilities

export const IPTV_PROVIDERS = [
  {
    id: 'iptv-org',
    name: 'IPTV-org (Default)',
    url: 'https://iptv-org.github.io/iptv/index.m3u'
  },
  {
    id: 'cricHd',
    name: 'CricHD (Alt)',
    url: 'https://raw.githubusercontent.com/abusaeeidx/CricHd-playlists-Auto-Update-permanent/refs/heads/main/ALL.m3u'
  },
  {
    id: 'devforge',
    name: 'DevForge (Alt)',
    url: 'https://iptv.devforge.qzz.io/playlist/playlist.m3u'
  },
  {
    id: 'plex',
    name: 'Plex (Alt)',
    url: 'https://raw.githubusercontent.com/BuddyChewChew/app-m3u-generator/main/playlists/plex_all.m3u'
  },
  {
    id: 'pluto',
    name: 'Pluto (Alt)',
    url: 'https://raw.githubusercontent.com/BuddyChewChew/app-m3u-generator/main/playlists/plutotv_all.m3u'
  },
  {
    id: 'samsungtvplus',
    name: 'Samsung TV Plus (Alt)',
    url: 'https://raw.githubusercontent.com/BuddyChewChew/app-m3u-generator/refs/heads/main/playlists/samsungtvplus_all.m3u'
  },
  {
    id: 'tubitv',
    name: 'Tubi (Alt)',
    url: 'https://raw.githubusercontent.com/BuddyChewChew/app-m3u-generator/refs/heads/main/playlists/tubi_all.m3u'
  },
  {
    id: 'freetv',
    name: 'Free TV (Alt)',
    url: 'https://raw.githubusercontent.com/tenorioabsgit/IPTV/refs/heads/main/playlist.m3u'
  },
  {
    id: 'ace',
    name: 'Ace (Alt)',
    url: 'https://raw.githubusercontent.com/dregs1/dregs1.github.io/f5422f13b8214f6373c0407f8651402cc6b937e1/xml/ace.m3u.xml'
  },
  {
    id: 'desporto',
    name: 'Desporto (Alt)',
    url: 'https://raw.githubusercontent.com/dregs1/dregs1.github.io/f5422f13b8214f6373c0407f8651402cc6b937e1/xml/desporto.m3u'
  }
];

export const getIPTVProvider = (id) => IPTV_PROVIDERS.find(p => p.id === id) || IPTV_PROVIDERS[0];

export const IPTV_URL = IPTV_PROVIDERS[0].url;

export function getChannelRouteKey(channel) {
  return channel?.id?.trim() || channel?.url || channel?.name || "";
}

export function encodeChannelRouteKey(channel) {
  return encodeURIComponent(getChannelRouteKey(channel));
}

export function decodeChannelRouteKey(key) {
  try {
    return decodeURIComponent(key);
  } catch {
    return key;
  }
}

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

export async function fetchPlaylistChannels(providerId = IPTV_PROVIDERS[0].id) {
  const provider = getIPTVProvider(providerId);
  const response = await fetch(provider.url);
  if (!response.ok) throw new Error(`IPTV ${response.status}`);
  const text = await response.text();
  return parseM3U(text.replace(/\r\n/g, '\n'));
}

export async function getChannelByRouteKey(key, providerId = IPTV_PROVIDERS[0].id) {
  const decoded = decodeChannelRouteKey(key);
  const channels = await fetchPlaylistChannels(providerId);
  return channels.find((channel) => {
    const channelKey = getChannelRouteKey(channel);
    return channelKey === decoded || channel.url === decoded || channel.name === decoded;
  }) || null;
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
