import { getTitle, getYear, isTV, TMDB_BASE, TMDB_KEY } from "../tmdb";
import { fetchProxyVideo } from "./proxyClient";
import { vidrockEncodePath } from "../vidrockBrowser.js";

const AFTER_DARK_ENTRY = "https://afterdark.best/";
const FREMBED_BASE = "https://frembed.work";
const MOFLIX_BASE = "https://moflix-stream.xyz";

function b64Encode(str) {
  return btoa(str).replace(/=+$/, "");
}

function getImdb(item) {
  const raw = item.external_ids?.imdb_id;
  if (!raw) return "";
  return String(raw).replace(/^tt/i, "");
}

function buildMeta(item, season, episode, opts = {}) {
  const tv = isTV(item);
  return {
    type: tv ? "tv" : "movie",
    season,
    episode,
    tmdbId: String(item.id),
    imdbId: getImdb(item),
    title: getTitle(item),
    year: getYear(item),
    lang: opts.lang ?? "en"
  };
}

async function getEpisodeInternalId(item, season, episode) {
  const res = await fetch(
    `${TMDB_BASE}/tv/${item.id}/season/${season}/episode/${episode}?api_key=${TMDB_KEY}`
  );
  if (!res.ok) throw new Error("Could not load episode metadata");
  const data = await res.json();
  return data.id;
}

async function resolveOne(name, targetUrl, meta) {
  const video = await fetchProxyVideo(targetUrl, meta);
  return { servers: [{ name, video }] };
}

function createProvider(id, name, buildTargetUrl, options = {}) {
  return {
    id,
    name,
    getUrl: async (item, season = 1, episode = 1, opts = {}) => {
      const meta = buildMeta(item, season, episode, opts);
      const tv = isTV(item);

      if (options.movieOnly && tv) {
        return { servers: [] };
      }

      const targetUrl = await buildTargetUrl(item, season, episode, meta, tv);
      if (!targetUrl) {
        return { servers: [] };
      }

      return resolveOne(name, targetUrl, meta);
    }
  };
}

export const afterDarkProvider = createProvider(
  "afterdark",
  "AfterDark",
  async () => AFTER_DARK_ENTRY
);

export const einschaltenProvider = createProvider(
  "einschalten",
  "Einschalten",
  async (item) => {
    if (isTV(item)) return null;
    return `https://einschalten.in/api/movies/${item.id}/watch`;
  },
  { movieOnly: true }
);

export const frembedProvider = createProvider(
  "frembed",
  "Frembed",
  async (item, season, episode, meta, tv) => {
    if (tv) {
      return `${FREMBED_BASE}/api/series?id=${meta.tmdbId}&sa=${season}&epi=${episode}&idType=tmdb`;
    }
    return `${FREMBED_BASE}/api/films?id=${meta.tmdbId}&idType=tmdb`;
  }
);

export const moflixProvider = {
  id: "moflix",
  name: "Moflix",
  getUrl: async (item, season = 1, episode = 1, opts = {}) => {
    const meta = buildMeta(item, season, episode, opts);
    const tv = isTV(item);

    if (!tv) {
      const pathId = b64Encode(`tmdb|movie|${item.id}`);
      const url = `${MOFLIX_BASE}/api/v1/titles/${pathId}?loader=titlePage`;
      return resolveOne("Moflix", url, meta);
    }

    const rawId = b64Encode(`tmdb|series|${item.id}`);
    const titlePage = `https://moflix-stream.xyz/api/v1/titles/${rawId}?loader=titlePage`;
    const titleRes = await fetch(`/api/moflix-meta?url=${encodeURIComponent(titlePage)}`);
    if (!titleRes.ok) throw new Error("Moflix title lookup failed");
    const titleData = await titleRes.json();
    const mediaId = titleData?.title?.id || rawId;
    const epUrl = `${MOFLIX_BASE}/api/v1/titles/${mediaId}/seasons/${season}/episodes/${episode}?loader=episodePage`;
    return resolveOne("Moflix", epUrl, meta);
  }
};

export const moviesapiProvider = createProvider(
  "moviesapi",
  "Moviesapi",
  async (item) => {
    if (isTV(item)) return null;
    return `https://moviesapi.club/movie/${item.id}`;
  },
  { movieOnly: true }
);

export const myFileStorageProvider = createProvider(
  "myfilestorage",
  "MyFileStorage",
  async (item, season, episode, meta, tv) => {
    if (!tv) {
      return `https://myfilestorage.xyz/${item.id}.mp4`;
    }
    const epId = await getEpisodeInternalId(item, season, episode);
    const e = String(episode).padStart(2, "0");
    return `https://myfilestorage.xyz/tv/${epId}/s${season}e${e}`;
  }
);

export const primeSrcProvider = createProvider(
  "primesrc",
  "PrimeSrc",
  async (item, season, episode, meta, tv) => {
    if (tv) {
      return `https://primesrc.me/api/v1/s?tmdb=${meta.tmdbId}&season=${season}&episode=${episode}&type=tv`;
    }
    return `https://primesrc.me/api/v1/s?tmdb=${meta.tmdbId}&type=movie`;
  }
);

export const twoEmbedProvider = createProvider(
  "twoembed",
  "TwoEmbed",
  async (item, season, episode, meta, tv) => {
    if (tv) {
      return `https://www.2embed.cc/embedtv/${item.id}&s=${season}&e=${episode}`;
    }
    return `https://www.2embed.cc/embed/${item.id}`;
  }
);

export const vidflixProvider = createProvider(
  "vidflix",
  "Vidflix",
  async (item, season, episode, meta, tv) => {
    if (tv) {
      return `https://vidflix.club/api/tv/${item.id}/${season}/${episode}`;
    }
    return `https://vidflix.club/api/movie/${item.id}`;
  }
);

export const vidLinkProvider = createProvider(
  "vidlink",
  "VidLink",
  async (item, season, episode, meta, tv) => {
    if (tv) {
      return `https://vidlink.pro/tv/${item.id}/${season}/${episode}`;
    }
    return `https://vidlink.pro/movie/${item.id}`;
  }
);

export const vidrockProvider = createProvider(
  "vidrock",
  "Vidrock",
  async (item, season, episode, meta, tv) => {
    const plain = tv ? `${item.id}_${season}_${episode}` : String(item.id);
    const enc = await vidrockEncodePath(plain);
    if (tv) {
      return `https://vidrock.net/api/tv/${enc}`;
    }
    return `https://vidrock.net/api/movie/${enc}`;
  }
);

export const vidsrcNetProvider = createProvider(
  "vidsrcnet",
  "Vidsrc.net",
  async (item, season, episode, meta, tv) => {
    if (tv) {
      return `https://vidsrc-embed.ru/embed/tv?tmdb=${item.id}&season=${season}&episode=${episode}`;
    }
    return `https://vidsrc-embed.ru/embed/movie?tmdb=${item.id}`;
  }
);

export const vidsrcRuProvider = createProvider(
  "vidsrcru",
  "Vidsrc.ru",
  async (item, season, episode, meta, tv) => {
    if (tv) {
      return `https://vidsrc.ru/tv/${item.id}/${season}/${episode}`;
    }
    return `https://vidsrc.ru/movie/${item.id}`;
  }
);

export const vidsrcToProvider = createProvider(
  "vidsrcto",
  "Vidsrc.to",
  async (item, season, episode, meta, tv) => {
    if (tv) {
      return `https://vidsrc.to/embed/tv/${item.id}/${season}/${episode}`;
    }
    return `https://vidsrc.to/embed/movie/${item.id}`;
  }
);

export const vixSrcProvider = createProvider(
  "vixsrc",
  "VixSrc",
  async (item, season, episode, meta, tv) => {
    if (tv) {
      return `https://vixsrc.to/tv/${item.id}/${season}/${episode}`;
    }
    return `https://vixsrc.to/movie/${item.id}`;
  }
);

const VIDEASY_LANG = {
  de: "german",
  it: "italian",
  fr: "french",
  es: "spanish"
};

function buildVideasyQuery(endpoint, item, season, episode, lang) {
  const tv = isTV(item);
  const title = encodeURIComponent(getTitle(item));
  const year = getYear(item) || "";
  const tmdbId = String(item.id);
  const imdb = getImdb(item) || "0";

  const q = new URLSearchParams({
    title,
    mediaType: tv ? "tv" : "movie",
    year,
    tmdbId,
    imdbId: imdb
  });
  if (tv) {
    q.set("episodeId", String(episode));
    q.set("seasonId", String(season));
  }
  if (lang !== "en" && VIDEASY_LANG[lang]) {
    q.set("language", VIDEASY_LANG[lang]);
  }
  return `https://api.videasy.net/${endpoint}/sources-with-title?${q.toString()}`;
}

export const videasyProvider = {
  id: "videasy",
  name: "Videasy",
  getUrl: async (item, season = 1, episode = 1, opts = {}) => {
    const meta = buildMeta(item, season, episode, opts);
    const lang = opts.lang ?? "en";
    const tv = isTV(item);

    const enMovieEndpoints = [
      "myflixerzupcloud",
      "cdn",
      "moviebox",
      "1movies",
      "primesrcme",
      "primewire",
      "m4uhd",
      "hdmovie"
    ];
    const enTvEndpoints = [
      "myflixerzupcloud",
      "moviebox",
      "1movies",
      "primesrcme",
      "primewire",
      "m4uhd",
      "hdmovie"
    ];

    const tryEndpoints = [];
    if (lang === "en") {
      const list = tv ? enTvEndpoints : enMovieEndpoints;
      for (const ep of list) {
        tryEndpoints.push(ep);
      }
    } else if (lang === "es") {
      tryEndpoints.push("cuevana-spanish");
    } else if (["de", "it", "fr"].includes(lang)) {
      tryEndpoints.push("meine");
    } else {
      const list = tv ? enTvEndpoints : enMovieEndpoints;
      for (const e of list) tryEndpoints.push(e);
    }

    let lastErr;
    for (const endpoint of tryEndpoints) {
      const url = buildVideasyQuery(endpoint, item, season, episode, lang);
      try {
        const video = await fetchProxyVideo(url, meta);
        return { servers: [{ name: `Videasy · ${endpoint}`, video }] };
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error("No Videasy source");
  }
};

export const vidzeeProvider = {
  id: "vidzee",
  name: "Vidzee",
  getUrl: async (item, season = 1, episode = 1, opts = {}) => {
    const meta = buildMeta(item, season, episode, opts);
    const tv = isTV(item);
    let lastErr;

    for (let n = 0; n <= 13; n++) {
      const url = tv
        ? `https://player.vidzee.wtf/api/server?id=${item.id}&ss=${season}&ep=${episode}&sr=${n}`
        : `https://player.vidzee.wtf/api/server?id=${item.id}&sr=${n}`;
      try {
        const video = await fetchProxyVideo(url, meta);
        return { servers: [{ name: `Vidzee · ${n}`, video }] };
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error("No Vidzee stream");
  }
};

export const PROVIDERS = [
  afterDarkProvider,
  einschaltenProvider,
  frembedProvider,
  moflixProvider,
  moviesapiProvider,
  myFileStorageProvider,
  primeSrcProvider,
  twoEmbedProvider,
  vidflixProvider,
  vidLinkProvider,
  vidrockProvider,
  vidsrcNetProvider,
  vidsrcRuProvider,
  vidsrcToProvider,
  videasyProvider,
  vidzeeProvider,
  vixSrcProvider
];

export const getProvider = (id) =>
  PROVIDERS.find((p) => p.id === id) || afterDarkProvider;
