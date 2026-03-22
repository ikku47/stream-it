// app/api/extract/route.js
import { NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';
import crypto from 'crypto';

// User Agent constants
const DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

// Helper functions
const base64Decode = (str) => Buffer.from(str, 'base64').toString('utf-8');
const base64Encode = (str) => Buffer.from(str).toString('base64');

// AES decryption helpers
const aesCbcDecrypt = (key, iv, data) => {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(data);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted;
};

const aesGcmDecrypt = (key, iv, data, tag) => {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(data);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted;
};

// RC4 decryption
const rc4Decrypt = (key, data) => {
  const keyBytes = Buffer.from(key, 'utf-8');
  const s = new Uint8Array(256);
  for (let i = 0; i < 256; i++) s[i] = i;

  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + keyBytes[i % keyBytes.length]) & 0xff;
    [s[i], s[j]] = [s[j], s[i]];
  }

  const result = Buffer.alloc(data.length);
  let i = 0;
  let k = 0;
  for (let idx = 0; idx < data.length; idx++) {
    i = (i + 1) & 0xff;
    k = (k + s[i]) & 0xff;
    [s[i], s[k]] = [s[k], s[i]];
    const t = (s[i] + s[k]) & 0xff;
    result[idx] = data[idx] ^ s[t];
  }
  return result;
};

// JsUnpacker implementation
const jsUnpacker = (packedScript) => {
  const match = packedScript.match(/eval\(function\(p,a,c,k,e,d\)(.*?)}\)/s);
  if (!match) return null;

  try {
    const code = match[1];
    const pMatch = code.match(/p='([^']+)'/);
    const aMatch = code.match(/a=(\d+)/);
    const cMatch = code.match(/c=(\d+)/);
    const kMatch = code.match(/k='([^']+)'/);

    if (!pMatch || !aMatch || !cMatch || !kMatch) return null;

    const p = pMatch[1];
    const a = parseInt(aMatch[1]);
    const c = parseInt(cMatch[1]);
    const k = kMatch[1].split('|');

    let unpacked = p;
    for (let i = 0; i < k.length; i++) {
      const regex = new RegExp(`\\b${i}\\b`, 'g');
      unpacked = unpacked.replace(regex, k[i]);
    }

    return unpacked;
  } catch (e) {
    return null;
  }
};

// Helper to extract base URL
const getBaseUrl = (url) => {
  const parsed = new URL(url);
  return `${parsed.protocol}//${parsed.host}`;
};

// Hex to bytes
const hexToBytes = (hex) => {
  const cleaned = hex.toLowerCase().replace(/[^0-9a-f]/g, '');
  const even = cleaned.length % 2 === 0 ? cleaned : '0' + cleaned;
  const bytes = new Uint8Array(even.length / 2);
  for (let i = 0; i < even.length; i += 2) {
    bytes[i / 2] = parseInt(even.substring(i, i + 2), 16);
  }
  return Buffer.from(bytes);
};

// Main extractor function
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  const videoType = searchParams.get('type') || 'movie';
  const language = searchParams.get('lang') || 'en';
  const season = searchParams.get('season');
  const episode = searchParams.get('episode');
  const tmdbId = searchParams.get('tmdbId');
  const imdbId = searchParams.get('imdbId');
  const title = searchParams.get('title');
  const year = searchParams.get('year');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const result = await extractVideo(targetUrl, videoType, language, {
      type: videoType,
      season,
      episode,
      tmdbId,
      imdbId,
      title,
      year
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function extractVideo(url, videoType, language, metadata = {}) {
  // Determine which extractor to use based on URL
  if (url.includes('afterdark') || url.includes('afterdark.best')) {
    return extractAfterDark(url, metadata);
  } else if (url.includes('amazon.com') || url.includes('drive.google.com')) {
    return extractAmazonDrive(url);
  } else if (url.includes('api.voirfilm')) {
    return extractApiVoirFilm(url);
  } else if (url.includes('bigwarp')) {
    return extractBigWarp(url);
  } else if (url.includes('moviesapi.club')) {
    return extractMoviesapi(url);
  } else if (url.includes('chillx') || url.includes('jeansaispasplus')) {
    return extractChillx(url);
  } else if (url.includes('closeload')) {
    return extractCloseload(url);
  } else if (url.includes('dailymotion')) {
    return extractDailymotion(url);
  } else if (url.includes('dood') || url.includes('dsvplay') || url.includes('myvidplay')) {
    return extractDoodLa(url);
  } else if (url.includes('dropload')) {
    return extractDropload(url);
  } else if (url.includes('einschalten')) {
    return extractEinschalten(url);
  } else if (url.includes('filemoon') || url.includes('bf0skv') || url.includes('byse')) {
    return extractFilemoon(url);
  } else if (url.includes('frembed')) {
    return extractFrembed(url, metadata);
  } else if (url.includes('fsvid')) {
    return extractFsvid(url);
  } else if (url.includes('goodstream')) {
    return extractGoodstream(url);
  } else if (url.includes('gupload')) {
    return extractGupload(url);
  } else if (url.includes('gxplayer')) {
    return extractGxPlayer(url);
  } else if (url.includes('hxfile')) {
    return extractHxfile(url);
  } else if (url.includes('lamovie') || url.includes('vimeos')) {
    return extractLamovie(url);
  } else if (url.includes('loadx')) {
    return extractLoadX(url);
  } else if (url.includes('luluvdo')) {
    return extractLuluVdo(url);
  } else if (url.includes('magasavor')) {
    return extractMagasavor(url);
  } else if (url.includes('my.mail.ru')) {
    return extractMailRu(url);
  } else if (url.includes('mixdrop')) {
    return extractMixDrop(url);
  } else if (url.includes('moflix-stream') || url.includes('moflix')) {
    return extractMoflix(url);
  } else if (url.includes('myfilestorage')) {
    return extractMyFileStorage(url);
  } else if (url.includes('ok.ru')) {
    return extractOkru(url);
  } else if (url.includes('oneupload') || url.includes('tipfly')) {
    return extractOneupload(url);
  } else if (url.includes('pcloud')) {
    return extractPcloud(url);
  } else if (url.includes('apu.animemovil2')) {
    return extractPlusPomla(url);
  } else if (url.includes('primesrc')) {
    return extractPrimeSrc(url, metadata, language);
  } else if (url.includes('rabbitstream') || url.includes('megacloud') || url.includes('dokicloud') || url.includes('premiumembeding')) {
    return extractRabbitstream(url);
  } else if (url.includes('ridoo')) {
    return extractRidoo(url);
  } else if (url.includes('rpmvid') || url.includes('cubeembed') || url.includes('loadm.cam')) {
    return extractRpmvid(url);
  } else if (url.includes('savefiles') || url.includes('streamhls')) {
    return extractSaveFiles(url);
  } else if (url.includes('sharecloudy')) {
    return extractShareCloudy(url);
  } else if (url.includes('streamhub')) {
    return extractStreamhub(url);
  } else if (url.includes('streamix') || url.includes('stmix')) {
    return extractStreamix(url);
  } else if (url.includes('streamruby') || url.includes('stmruby') || url.includes('rubystm')) {
    return extractStreamruby(url);
  } else if (url.includes('streamtape') || url.includes('streamta.site')) {
    return extractStreamtape(url);
  } else if (url.includes('strmup') || url.includes('streamup')) {
    return extractStreamUp(url);
  } else if (url.includes('streamwish') || url.includes('wishfast') || url.includes('playerwish')) {
    return extractStreamWish(url);
  } else if (url.includes('supervideo')) {
    return extractSupervideo(url);
  } else if (url.includes('2embed')) {
    return extractTwoEmbed(url);
  } else if (url.includes('upzur')) {
    return extractUpZur(url);
  } else if (url.includes('uqload')) {
    return extractUqload(url);
  } else if (url.includes('veev') || url.includes('kinoger') || url.includes('poophq') || url.includes('doods')) {
    return extractVeev(url);
  } else if (url.includes('vidara') || url.includes('vidara.so')) {
    return extractVidara(url);
  } else if (url.includes('videasy.net')) {
    return extractVideasy(url);
  } else if (url.includes('video.sibnet.ru')) {
    return extractVideoSibNet(url);
  } else if (url.includes('vidflix.club')) {
    return extractVidflix(url);
  } else if (url.includes('vidguard') || url.includes('vembed') || url.includes('bembed')) {
    return extractVidGuard(url);
  } else if (url.includes('vidhide') || url.includes('dhtpre') || url.includes('filelions')) {
    return extractVidHide(url);
  } else if (url.includes('vidlink.pro')) {
    return extractVidLink(url);
  } else if (url.includes('vidmoly')) {
    return extractVidMoLy(url);
  } else if (url.includes('vidnest.io')) {
    return extractVidnest(url);
  } else if (url.includes('vidora.stream')) {
    return extractVidora(url);
  } else if (url.includes('vidoza') || url.includes('videzz')) {
    return extractVidoza(url);
  } else if (url.includes('vidplay.site') || url.includes('mcloud.bz') || url.includes('vidplay.online')) {
    return extractVidplay(url);
  } else if (url.includes('vidply.com')) {
    return extractVidPly(url);
  } else if (url.includes('vidrock.net')) {
    return extractVidrock(url);
  } else if (url.includes('vidsonic.net')) {
    return extractVidsonic(url);
  } else if (url.includes('vidsrc-embed.ru')) {
    return extractVidsrcNet(url);
  } else if (url.includes('vidsrc.ru')) {
    return extractVidsrcRu(url);
  } else if (url.includes('vidsrc.to')) {
    return extractVidsrcTo(url);
  } else if (url.includes('player.vidzee.wtf')) {
    return extractVidzee(url);
  } else if (url.includes('vidzy.org')) {
    return extractVidzy(url);
  } else if (url.includes('vixcloud.co')) {
    return extractVixcloud(url, language);
  } else if (url.includes('vixsrc.to')) {
    return extractVixSrc(url, language);
  } else if (url.includes('voe.sx')) {
    return extractVoe(url);
  } else if (url.includes('yourupload') || url.includes('yucache')) {
    return extractYourUpload(url);
  } else {
    return extractDefault(url);
  }
}

// ============= EXTRACTOR IMPLEMENTATIONS =============

async function extractAfterDark(url, metadata) {
  const mainUrl = getBaseUrl(url);

  // Build payload for API call
  const payload = buildAfterDarkPayload(metadata);
  const encodedPayload = encodeURIComponent(payload);

  const providers = [
    { name: "Premium", hash: "aa86800c3ec95e610210f8378c316734ee92a09ee00f8c708c1a06c616651e8f" },
    { name: "Raven (fdla)", hash: "63e997074c73a7b57239e53ac7618f3e1ef81bda3f0ab47ee0ecc82bf0493904" },
    { name: "Willow (zekd)", hash: "ffe22be1dcd9d941bd4d09121338c70500fc067dcd94b1168079ba789e7c46c4" },
    { name: "Alpha (lkua)", hash: "d7ae23a39378ba1864d998d52c010e969f8344ebaebf97436d9c7bf3b592667d" },
    { name: "Yuna (msfu)", hash: "24758778992d2473ae2618adf856f8902a675718eef18169c854d07d1fcad298" },
    { name: "Ive (iodv)", hash: "70b726570a3111d2c6d51ae57139e4af4b69392ebbf32293c5d7f7ec53922cd5" },
    { name: "Lumi (redu)", hash: "e818c6028fbd6b8c58ce3cdb1d8be2972ffa0a486361fc07b7e9d2bd0c2d95f2" },
    { name: "Beta (zele)", hash: "e89c6cdf5d5296dd5f0e864a030efdfcaa1896773fb9f0d7e6926acaed7f4a86" },
    { name: "Bunny (ofsa)", hash: "dc4cc6245be6fec3d7ea391bfac09cb5d4090e5135629b0e6e81bacd3d10e8dc" },
    { name: "Gamma (offi)", hash: "c3ce337885c3aae80534c9fa298aae6a4b37fa0188c09238610beeacd553caf1" }
  ];

  const servers = [];
  const seenUrls = new Set();

  for (const provider of providers) {
    try {
      const apiUrl = `${mainUrl}/_serverFn/${provider.hash}?payload=${encodedPayload}`;
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': DEFAULT_USER_AGENT,
          'Referer': `${mainUrl}/`,
          'X-Requested-With': 'XMLHttpRequest',
          'x-tsr-serverfn': 'true'
        }
      });

      const body = await response.text();
      if (body.includes('"error"') && body.includes('"details"')) continue;

      const blockPattern = /"k":\[([^\]]+)\],"v":\[([^\]]+)\]/g;
      let match;

      while ((match = blockPattern.exec(body)) !== null) {
        const keysStr = match[1];
        const valsStr = match[2];

        const keys = keysStr.split(',').map(k => k.trim().replace(/"/g, ''));
        const vals = [];
        const valMatcher = /"s":"([^"]*)"/g;
        let valMatch;
        while ((valMatch = valMatcher.exec(valsStr)) !== null) {
          vals.push(valMatch[1]);
        }

        if (keys.length !== vals.length) continue;

        const data = {};
        for (let i = 0; i < keys.length; i++) {
          data[keys[i]] = vals[i];
        }

        const service = data.service?.toLowerCase() || '';
        let videoUrl = data.url || data.embedUrl;
        if (!videoUrl) continue;

        // Proxy logic
        const prefixes = {
          'voe': 'https://proxy.afterdark.baby/boom-clap?url=',
          'vidmoly': 'https://proxy.afterdark.baby/elizabeth-taylor?url=',
          'uqload': 'https://proxy.afterdark.baby/alejandro?url=',
          'vidzy': 'https://proxy.afterdark.baby/rolly?url='
        };

        const isSource = provider.name === 'Premium' ||
          (prefixes[service] && (videoUrl = prefixes[service] + encodeURIComponent(videoUrl))) ||
          service === 'unknown' || service === '';

        if (!isSource) continue;

        const resolvedProv = data.provider || provider.name.split(' ')[0];
        const quality = data.quality || 'hd';
        const lang = data.language || 'vf';
        const serverName = `${resolvedProv} • ${quality} • ${lang}`;

        if (videoUrl.startsWith('http') && !seenUrls.has(videoUrl)) {
          seenUrls.add(videoUrl);
          servers.push({
            id: `afd_${servers.length}`,
            name: serverName,
            src: videoUrl,
            video: {
              source: videoUrl,
              type: videoUrl.includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4',
              headers: {
                Referer: `${mainUrl}/`,
                'User-Agent': DEFAULT_USER_AGENT
              }
            }
          });
        }
      }
    } catch (e) {
      continue;
    }
  }

  if (servers.length === 0) throw new Error('No video sources found');
  return servers[0].video;
}

/** Matches AfterDarkExtractor.kt buildPayload: one shape with season+episode for movies and TV. */
function buildAfterDarkPayload(metadata) {
  const { type, tmdbId, imdbId, title, year, season, episode } = metadata;
  const mediaType = type === 'movie' ? 'movie' : 'tv';
  const s = type === 'movie' ? 1 : (Number.parseInt(season, 10) || 1);
  const ep = type === 'movie' ? 1 : (Number.parseInt(episode, 10) || 1);

  return JSON.stringify({
    t: {
      t: 10, i: 0,
      p: {
        k: ['data'],
        v: [{
          t: 10, i: 1,
          p: {
            k: ['title', 'type', 'tmdbId', 'imdbId', 'releaseYear', 'season', 'episode'],
            v: [
              { t: 1, s: title },
              { t: 1, s: mediaType },
              { t: 1, s: tmdbId },
              { t: 1, s: imdbId || '0' },
              { t: 1, s: year || '' },
              { t: 2, s: s },
              { t: 2, s: ep }
            ]
          },
          o: 0
        }]
      },
      o: 0
    },
    f: 63,
    m: []
  });
}

async function extractAmazonDrive(url) {
  const shareIdMatch = url.match(/\/shares\/([^/]+)/);
  const shareId = shareIdMatch?.[1];
  if (!shareId) throw new Error('ShareId not found in URL');

  const shareResponse = await fetch(`https://www.amazon.com/drive/v1/shares/${shareId}?resourceVersion=V2&ContentType=JSON&asset=ALL`, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Accept': 'application/json',
      'Referer': 'https://www.amazon.com/clouddrive'
    }
  });

  const shareData = await shareResponse.json();
  const nodeId = shareData.nodeInfo?.id;
  if (!nodeId) throw new Error('Node ID not found');

  const childrenResponse = await fetch(`https://www.amazon.com/drive/v1/nodes/${nodeId}/children?resourceVersion=V2&ContentType=JSON&limit=200&sort=["kind DESC", "modifiedDate DESC"]&asset=ALL&tempLink=true&shareId=${shareId}`, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Accept': 'application/json'
    }
  });

  const childrenData = await childrenResponse.json();
  const tempLink = childrenData.data?.[0]?.tempLink;
  if (!tempLink) throw new Error('No tempLink found');

  return {
    source: tempLink,
    type: 'video/mp4',
    subtitles: [],
    headers: {}
  };
}

async function extractApiVoirFilm(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': 'https://api.voirfilm.cam/'
    }
  });

  const html = await response.text();
  const dom = new JSDOM(html);
  const links = [];

  dom.window.document.querySelectorAll('div.top ul.content > li').forEach((item, idx) => {
    const videoUrl = item.getAttribute('data-url');
    if (videoUrl) {
      links.push({
        id: `apivf_${idx}`,
        name: item.textContent || `Server ${idx}`,
        src: videoUrl
      });
    }
  });

  if (links.length === 0) throw new Error('No video links found');
  return extractVideo(links[0].src);
}

async function extractBigWarp(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': 'https://bigwarp.cc/'
    }
  });

  const html = await response.text();
  const dom = new JSDOM(html);
  const scripts = dom.window.document.querySelectorAll('script[type="text/javascript"]');

  let m3u8 = null;
  for (const script of scripts) {
    const scriptData = script.textContent;
    if (scriptData.includes('jwplayer') && scriptData.includes('sources') && scriptData.includes('file')) {
      const match = scriptData.match(/file\s*:\s*["']([^"']+)["']/);
      if (match) {
        m3u8 = match[1];
        break;
      }
    }
  }

  if (!m3u8) throw new Error('Could not find HLS source');

  return {
    source: m3u8,
    type: 'video/mp4',
    subtitles: [],
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': 'https://bigwarp.cc/'
    }
  };
}

/** Matches standalone MoviesapiExtractor.kt (iframe + Vidora), not ChillxExtractor.Moviesapi. */
async function extractMoviesapi(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': 'https://pressplay.top/'
    }
  });

  const html = await response.text();
  const dom = new JSDOM(html);
  const iframe = dom.window.document.querySelector('iframe')?.getAttribute('src');
  if (!iframe) throw new Error('Can\'t retrieve iframe');

  const iframeUrl = iframe.startsWith('//') ? `https:${iframe}` : iframe;
  return extractVidora(iframeUrl);
}

async function extractChillx(url) {
  const baseUrl = getBaseUrl(url);

  // Get keys from GitHub
  const keysResponse = await fetch('https://raw.githubusercontent.com/Rowdy-Avocado/multi-keys/keys/index.html');
  const keysData = await keysResponse.text();
  const keysMatch = keysData.match(/chillx:\s*\["([^"]+)"/);
  const key = keysMatch?.[1];
  if (!key) throw new Error('Failed to get decryption key');

  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': baseUrl
    }
  });

  const html = await response.text();
  const contentMatch = html.match(/\s*=\s*'([^']+)/);
  const content = contentMatch?.[1];
  if (!content) throw new Error('Cannot retrieve content');

  // AES decrypt
  const keyBytes = Buffer.from(key, 'utf-8');
  const iv = Buffer.alloc(16, 0);
  const encrypted = Buffer.from(content, 'base64');
  const decrypted = aesCbcDecrypt(keyBytes, iv, encrypted);
  const decryptStr = decrypted.toString('utf-8').replace(/\\n/g, '\n').replace(/\\/g, '');

  const sourceMatch = decryptStr.match(/"file":\s*"([^"]+)/);
  const source = sourceMatch?.[1];
  if (!source) throw new Error('Cannot retrieve source');

  const subtitles = [];
  const subRegex = /\{"file":"([^"]+)","label":"([^"]+)","kind":"captions"/g;
  let subMatch;
  while ((subMatch = subRegex.exec(decryptStr)) !== null) {
    subtitles.push({
      label: subMatch[2],
      file: subMatch[1],
      default: false
    });
  }

  return {
    source,
    type: source.includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4',
    subtitles,
    headers: { Referer: baseUrl }
  };
}

async function extractCloseload(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': 'https://ridomovies.tv/'
    }
  });

  let html = await response.text();

  // Unpack if needed
  let unpacked = html;
  if (html.includes('eval(function(p,a,c,k,e,d)')) {
    const packedMatch = html.match(/eval\(function\(p,a,c,k,e,d\).*?<\/script>/s);
    if (packedMatch) {
      const unpackedResult = jsUnpacker(packedMatch[0]);
      if (unpackedResult) unpacked = unpackedResult;
    }
  }

  // Find base64 strings
  const base64Matches = unpacked.match(/["'](aHR0[a-zA-Z0-9+/=]{20,})["']/g) || [];
  for (const match of base64Matches) {
    const b64 = match.replace(/["']/g, '');
    try {
      const decoded = Buffer.from(b64, 'base64').toString('utf-8');
      if (decoded.includes('http') && decoded.includes('.mp4')) {
        return {
          source: decoded,
          type: 'video/mp4',
          subtitles: [],
          headers: { Referer: 'https://closeload.top/' }
        };
      }
    } catch (e) { }
  }

  throw new Error('No video found');
}

async function extractDailymotion(url) {
  const id = url.split('/').pop().split('?')[0].replace('video=', '');
  const locale = 'en';
  const v1st = crypto.randomUUID();
  const ts = Math.floor(Date.now() / 1000).toString();
  const viewId = Array(19).fill().map(() => Math.random().toString(36)[2]).join('');

  const response = await fetch(`https://geo.dailymotion.com/video/${id}.json?legacy=true&player-id=xtv3w&is_native_app=0&app=com.dailymotion.neon&client_type=website&section_type=player&component_style=_&parallelCalls=1&locale=${locale}&dmV1st=${v1st}&dmTs=${ts}&dmViewId=${viewId}`, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': 'https://geo.dailymotion.com/player/xtv3w.html?'
    }
  });

  const data = await response.json();
  const manifestUrl = data.qualities?.auto?.[0]?.url;
  if (!manifestUrl) throw new Error('Manifest URL not found');

  return {
    source: manifestUrl,
    type: 'application/vnd.apple.mpegurl',
    subtitles: [],
    headers: { Referer: 'https://geo.dailymotion.com' }
  };
}

async function extractDoodLa(url) {
  const embedUrl = url.replace('/d/', '/e/');
  const response = await fetch(embedUrl, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': url
    }
  });

  const html = await response.text();

  const md5Match = html.match(/\/pass_md5\/[^']*/);
  if (!md5Match) throw new Error('Could not find md5 path');

  const baseUrl = getBaseUrl(response.url);
  const md5Url = baseUrl + md5Match[0];

  const videoPrefixResponse = await fetch(md5Url, {
    headers: { Referer: embedUrl }
  });
  const videoPrefix = await videoPrefixResponse.text();

  const randomStr = Array(10).fill().map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join('');
  const token = md5Url.split('/').pop();

  const finalUrl = videoPrefix.trim() + randomStr + `?token=${token}`;

  return {
    source: finalUrl,
    type: 'application/vnd.apple.mpegurl',
    subtitles: [],
    headers: { Referer: baseUrl }
  };
}

async function extractDropload(url) {
  const response = await fetch(url);
  const html = await response.text();

  const scriptMatch = html.match(/eval\(function\(p,a,c,k,e,d\).*?<\/script>/s);
  if (!scriptMatch) throw new Error('Packed JS not found');

  const unpacked = jsUnpacker(scriptMatch[0]);
  if (!unpacked) throw new Error('Unpack failed');

  const fileMatch = unpacked.match(/file\s*:\s*["']([^"']+)["']/);
  const streamUrl = fileMatch?.[1];
  if (!streamUrl) throw new Error('Stream URL not found');

  const tracksMatch = unpacked.match(/tracks\s*:\s*\[(.*?)\]/s);
  const subtitles = [];
  if (tracksMatch) {
    const captionRegex = /file\s*:\s*"([^"]+)"\s*,\s*label\s*:\s*"([^"]+)"\s*,\s*kind\s*:\s*"captions"/g;
    let capMatch;
    while ((capMatch = captionRegex.exec(tracksMatch[1])) !== null) {
      subtitles.push({
        label: capMatch[2],
        file: capMatch[1],
        default: false
      });
    }
  }

  const referer = getBaseUrl(url);

  return {
    source: streamUrl,
    type: 'application/vnd.apple.mpegurl',
    subtitles,
    headers: { Referer: referer }
  };
}

async function extractEinschalten(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Referer': 'https://einschalten.in/'
    }
  });

  const data = await response.json();
  const streamUrl = data.streamUrl;
  if (!streamUrl) throw new Error('No stream found');

  return extractDoodLa(streamUrl);
}

async function extractFilemoon(url) {
  const match = url.match(/\/(e|d)\/([a-zA-Z0-9]+)/);
  if (!match) throw new Error('Could not extract video ID');

  const linkType = match[1];
  const videoId = match[2];
  const currentDomain = getBaseUrl(url);

  const detailsResponse = await fetch(`${currentDomain}/api/videos/${videoId}/embed/details`);
  const details = await detailsResponse.json();
  const embedFrameUrl = details.embed_frame_url;
  if (!embedFrameUrl) throw new Error('embed_frame_url not found');

  let playbackDomain;
  const headers = {
    'User-Agent': DEFAULT_USER_AGENT,
    'Accept': 'application/json'
  };

  if (linkType === 'd') {
    playbackDomain = currentDomain;
    headers['Referer'] = url;
  } else {
    playbackDomain = getBaseUrl(embedFrameUrl);
    headers['Referer'] = embedFrameUrl;
    headers['X-Embed-Parent'] = url;
  }

  const playbackResponse = await fetch(`${playbackDomain}/api/videos/${videoId}/embed/playback`, {
    headers
  });
  const playbackData = await playbackResponse.json();
  const playback = playbackData.playback;
  if (!playback) throw new Error('No playback data');

  // Decrypt playback data
  const iv = Buffer.from(playback.iv, 'base64');
  const payload = Buffer.from(playback.payload, 'base64');
  const p1 = Buffer.from(playback.key_parts[0], 'base64');
  const p2 = Buffer.from(playback.key_parts[1], 'base64');
  const key = Buffer.concat([p1, p2]);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(payload.subarray(-16));
  const decrypted = decipher.update(payload.subarray(0, -16));
  const decryptedStr = Buffer.concat([decrypted, decipher.final()]).toString('utf-8');

  const sources = JSON.parse(decryptedStr).sources;
  if (!sources || sources.length === 0) throw new Error('No sources found');

  const sourceUrl = sources[0].url;

  return {
    source: sourceUrl,
    type: sourceUrl.includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4',
    subtitles: [],
    headers: {
      Referer: `${playbackDomain}/`,
      'User-Agent': DEFAULT_USER_AGENT,
      Origin: playbackDomain
    }
  };
}

async function extractFrembed(url, metadata) {
  const mainUrl = getBaseUrl(url);

  // Build API URL based on type
  let apiUrl;
  if (metadata.type === 'movie') {
    apiUrl = `${mainUrl}/api/films?id=${metadata.tmdbId}&idType=tmdb`;
  } else {
    apiUrl = `${mainUrl}/api/series?id=${metadata.tmdbId}&sa=${metadata.season}&epi=${metadata.episode}&idType=tmdb`;
  }

  const response = await fetch(apiUrl, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  const links = [
    data.link1, data.link2, data.link3, data.link4, data.link5, data.link6, data.link7,
    data.link1vostfr, data.link2vostfr, data.link3vostfr, data.link4vostfr, data.link5vostfr, data.link6vostfr, data.link7vostfr,
    data.link1vo, data.link2vo, data.link3vo, data.link4vo, data.link5vo, data.link6vo, data.link7vo
  ].filter(l => l);

  if (links.length === 0) throw new Error('No video links found');

  // Follow redirect to get final URL
  const firstLink = links[0].startsWith('/') ? mainUrl + links[0] : links[0];
  const redirectResponse = await fetch(firstLink, { redirect: 'manual' });
  const finalUrl = redirectResponse.headers.get('location') || firstLink;

  return extractVideo(finalUrl);
}

async function extractFsvid(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': getBaseUrl(url)
    }
  });

  const html = await response.text();
  const scriptMatch = html.match(/eval\(function\(p,a,c,k,e,d\).*?<\/script>/s);
  if (!scriptMatch) throw new Error('Packed JS not found');

  const unpacked = jsUnpacker(scriptMatch[0]);
  if (!unpacked) throw new Error('Unpack failed');

  const srcMatch = unpacked.match(/src\s*:\s*["']([^"']+)["']/);
  const m3u8 = srcMatch?.[1];
  if (!m3u8) throw new Error('Stream URL not found');

  return {
    source: m3u8,
    type: 'application/vnd.apple.mpegurl',
    subtitles: [],
    headers: {}
  };
}

async function extractGoodstream(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT
    }
  });

  const html = await response.text();
  const dom = new JSDOM(html);
  const scripts = dom.window.document.querySelectorAll('script[type*="javascript"]');

  let m3u8 = null;
  for (const script of scripts) {
    const scriptData = script.textContent;
    if (scriptData.includes('jwplayer') && scriptData.includes('sources') && scriptData.includes('file')) {
      const match = scriptData.match(/file\s*:\s*["']([^"']+)["']/);
      if (match) {
        m3u8 = match[1];
        break;
      }
    }
  }

  if (!m3u8) throw new Error('Cannot retrieve source');

  return {
    source: m3u8,
    type: 'application/vnd.apple.mpegurl',
    subtitles: [],
    headers: { 'User-Agent': DEFAULT_USER_AGENT }
  };
}

async function extractGoogleDrive(url) {
  const fileIdMatch = url.match(/\/file\/d\/([^/]+)/);
  const fileId = fileIdMatch?.[1];
  if (!fileId) throw new Error('File ID not found in URL');

  const response = await fetch(`https://content-workspacevideo-pa.googleapis.com/v1/drive/media/${fileId}/playback?key=AIzaSyDVQw45DwoYh632gvsP5vPDqEKvb-Ywnb8&$unique=gc999`, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Accept': '*/*',
      'Origin': 'https://drive.google.com',
      'Referer': 'https://drive.google.com/',
      'x-clientdetails': 'appVersion=5.0%20(Windows%20NT%2010.0%3B%20Win64%3B%20x64)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F142.0.0.0%20Safari%2F537.36&platform=Win32&userAgent=Mozilla%2F5.0%20(Windows%20NT%2010.0%3B%20Win64%3B%20x64)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F142.0.0.0%20Safari%2F537.36',
      'x-goog-encode-response-if-executable': 'base64',
      'x-javascript-user-agent': 'google-api-javascript-client/1.1.0'
    }
  });

  const data = await response.json();
  const hlsManifestUrl = data.mediaStreamingData?.hlsManifestUrl;
  if (!hlsManifestUrl) throw new Error('HLS manifest URL not found');

  return {
    source: hlsManifestUrl,
    type: 'application/vnd.apple.mpegurl',
    subtitles: [],
    headers: {
      Referer: 'https://youtube.googleapis.com/',
      Origin: 'https://youtube.googleapis.com',
      'User-Agent': DEFAULT_USER_AGENT
    }
  };
}

async function extractGupload(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': DEFAULT_USER_AGENT }
  });

  const html = await response.text();

  // Extract XOR key
  const pMatch = html.match(/_p=\[([^\]]+)\]/);
  if (!pMatch) throw new Error('XOR key list not found');

  const key = [...pMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1]).join('');

  // Extract encoded config
  const cfgMatch = html.match(/_cfg\s*=\s*_(?:dp|xd)\(['"]([^'"]+)['"]\)/);
  if (!cfgMatch) throw new Error('_cfg configuration not found');

  const encoded = cfgMatch[1];
  const b64Data = encoded.split('~')[1];
  const decodedBytes = Buffer.from(b64Data, 'base64');

  let result = '';
  for (let i = 0; i < decodedBytes.length; i++) {
    result += String.fromCharCode(decodedBytes[i] ^ key.charCodeAt(i % key.length));
  }

  const config = JSON.parse(result);
  const videoUrl = config.videoUrl;
  if (!videoUrl) throw new Error('Video URL not found');

  return {
    source: videoUrl,
    type: videoUrl.includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4',
    subtitles: [],
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      Referer: 'https://gupload.xyz/'
    }
  };
}

async function extractGxPlayer(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      Referer: 'https://watch.gxplayer.xyz/'
    }
  });

  const html = await response.text();
  const dom = new JSDOM(html);
  const script = dom.window.document.querySelector('script')?.textContent || '';

  const id = script.match(/"id":"([^"]+)"/)?.[1];
  const uid = script.match(/"uid":"([^"]+)"/)?.[1];
  const md5 = script.match(/"md5":"([^"]+)"/)?.[1];
  const status = script.match(/"status":"([^"]+)"/)?.[1];

  if (!uid || !md5 || !id) throw new Error('Could not extract video parameters');

  const videoUrl = `https://watch.gxplayer.xyz/m3u8/${uid}/${md5}/master.txt?s=1&id=${id}&cache=${status || ''}`;

  return {
    source: videoUrl,
    type: 'application/vnd.apple.mpegurl',
    subtitles: [],
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      Referer: 'https://watch.gxplayer.xyz/'
    }
  };
}

async function extractHxfile(url) {
  const fileCode = url.split('/').pop().split('.')[0];
  const embedUrl = url.includes('/embed-') ? url : `https://hxfile.co/embed-${fileCode}.html`;

  const response = await fetch(embedUrl, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      Referer: url
    }
  });

  const html = await response.text();
  const packedMatch = html.match(/(eval\(function\(p,a,c,k,e,d\)[\s\S]*?)<\/script>/);
  if (!packedMatch) throw new Error('Packed JS not found');

  let unpacked = jsUnpacker(packedMatch[1]);
  if (!unpacked) throw new Error('Unpacked is null');

  // Try XOR decryption
  const xorMatch = unpacked.match(/var\s+(_[0-9a-f]{6})\s*=\s*"([^"]+)".*?var\s+(_0x[0-9a-f]{6})\s*=\s*_[0-9a-z]{6}\(\)/s);
  if (xorMatch) {
    const payload = xorMatch[2];
    const key = xorMatch[3];
    const data = Buffer.from(payload, 'base64');
    let decrypted = '';
    for (let i = 0; i < data.length; i++) {
      decrypted += String.fromCharCode(data[i] ^ key.charCodeAt(i % key.length));
    }
    unpacked = decrypted;
  }

  const finalMatch = unpacked.match(/sources[\s\S]*?["']?file["']?\s*[:=]\s*["']([^"']+)["']/);
  const finalUrl = finalMatch?.[1];
  if (!finalUrl) throw new Error('No file link found');

  return {
    source: finalUrl,
    type: finalUrl.includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4',
    subtitles: [],
    headers: {}
  };
}

async function extractLamovie(url) {
  const response = await fetch(url);
  const html = await response.text();

  const packedMatch = html.match(/(eval\(function\(p,a,c,k,e,d\)[\s\S]*?)<\/script>/);
  if (!packedMatch) throw new Error('Packed JS not found');

  const unpacked = jsUnpacker(packedMatch[1]);
  if (!unpacked) throw new Error('Unpacked is null');

  const fileMatch = unpacked.match(/file\s*:\s*["']([^"']+)["']/);
  const streamUrl = fileMatch?.[1];
  if (!streamUrl) throw new Error('No file found');

  return {
    source: streamUrl,
    type: streamUrl.includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4',
    subtitles: [],
    headers: {}
  };
}

async function extractLoadX(url) {
  const videoId = url.split('/').pop();

  const getResponse = await fetch(url, {
    headers: { 'User-Agent': DEFAULT_USER_AGENT }
  });

  const setCookieHeader = getResponse.headers.get('set-cookie');
  const firePlayerCookie = setCookieHeader?.split(';')[0];
  if (!firePlayerCookie) throw new Error('fireplayer_player cookie not found');

  const postResponse = await fetch('https://loadx.ws/player/index.php', {
    method: 'POST',
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': 'https://loadx.ws',
      'Cookie': firePlayerCookie,
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: new URLSearchParams({
      data: videoId,
      do: 'getVideo'
    })
  });

  const data = await postResponse.json();
  const videoUrl = data.videoSource;
  if (!videoUrl) throw new Error('videoSource not found');

  return {
    source: videoUrl,
    type: 'application/vnd.apple.mpegurl',
    subtitles: [],
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      Referer: 'https://loadx.ws',
      Origin: 'https://loadx.ws',
      Cookie: firePlayerCookie
    }
  };
}

async function extractLuluVdo(url) {
  const response = await fetch(url);
  const html = await response.text();

  const sourceMatch = html.match(/sources:\s*\[\{file:"(.*?)"\}/);
  const source = sourceMatch?.[1];
  if (!source) throw new Error('Cannot retrieve source');

  const tracksMatch = html.match(/tracks:\s*\[(.*?)\]/);
  const subtitles = [];
  if (tracksMatch) {
    const subRegex = /file:\s*"([^"]+)",\s*label:\s*"([^"]+)"/g;
    let subMatch;
    while ((subMatch = subRegex.exec(tracksMatch[1])) !== null) {
      if (subMatch[2] !== 'Upload captions') {
        subtitles.push({
          label: subMatch[2],
          file: subMatch[1],
          default: false
        });
      }
    }
  }

  return {
    source,
    type: source.includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4',
    subtitles,
    headers: {}
  };
}

async function extractMagasavor(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': 'https://magasavor.net/'
    }
  });

  const html = await response.text();
  const dom = new JSDOM(html);
  const scriptTag = dom.window.document.querySelector('script[type="application/json"]');
  const encodedString = scriptTag?.textContent?.trim() || '';

  try {
    const decrypted = JSON.parse(encodedString);
    const m3u8 = decrypted.source;
    if (m3u8) {
      return {
        source: m3u8,
        type: 'application/vnd.apple.mpegurl',
        subtitles: [],
        headers: {}
      };
    }
  } catch (e) { }

  throw new Error('Could not extract video source');
}

async function extractMailRu(url) {
  const videoId = url.match(/embed\/([0-9]+)/)?.[1];
  if (!videoId) throw new Error('Could not extract video ID');

  const timestamp = Date.now();
  const metaUrl = `https://my.mail.ru/+/video/meta/${videoId}?xemail=&ajax_call=1&func_name=&mna=&mnb=&ext=1&_=${timestamp}`;

  const response = await fetch(metaUrl);
  const data = await response.json();

  const videos = data.videos;
  if (!videos || videos.length === 0) throw new Error('No videos found');

  let selectedVideo = null;
  for (const video of videos) {
    if (video.url) {
      selectedVideo = video;
      break;
    }
  }

  if (!selectedVideo) throw new Error('No valid videos found');

  let streamUrl = selectedVideo.url;
  if (streamUrl.startsWith('//')) {
    streamUrl = `https:${streamUrl}`;
  }

  return {
    source: streamUrl,
    type: streamUrl.includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4',
    subtitles: [],
    headers: {}
  };
}

async function extractMixDrop(url) {
  const cleanUrl = url
    .replace('/f/', '/e/')
    .replace('.club/', '.ag/')
    .replace(/^(https?:\/\/[^/]+\/e\/[^/?#]+).*$/, '$1');

  const response = await fetch(cleanUrl, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': getBaseUrl(url),
      'Accept': 'text/html',
      'X-Requested-With': 'XMLHttpRequest'
    }
  });

  const html = await response.text();
  const packedMatch = html.match(/(eval\(function\(p,a,c,k,e,d\)[\s\S]*?)<\/script>/);

  let script = html;
  if (packedMatch) {
    const unpacked = jsUnpacker(packedMatch[1]);
    if (unpacked) script = unpacked;
  }

  const srcMatch = script.match(/wurl.*?=.*?"(.*?)";/);
  let sourceUrl = srcMatch?.[1];
  if (!sourceUrl) throw new Error('Source not found');

  if (sourceUrl.startsWith('//')) sourceUrl = `https:${sourceUrl}`;
  if (!sourceUrl.startsWith('http')) sourceUrl = `https://${sourceUrl}`;

  return {
    source: sourceUrl,
    type: 'application/vnd.apple.mpegurl',
    subtitles: [],
    headers: { 'User-Agent': DEFAULT_USER_AGENT }
  };
}

async function extractMoflix(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': 'https://moflix-stream.xyz/',
      'Accept': 'application/json'
    }
  });

  const data = await response.json();
  const videos = data.videos || data.title?.videos || data.episode?.videos || [];

  if (videos.length === 0) throw new Error('No video sources found');

  const video = videos[0];
  return {
    source: video.src,
    type: video.src?.includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4',
    subtitles: [],
    headers: { Referer: 'https://moflix-stream.xyz/' }
  };
}

async function extractMyFileStorage(url) {
  let videoUrl = url;
  let success = false;

  for (const tryUrl of [videoUrl, videoUrl.replace('.mp4', '-1.mp4')]) {
    try {
      const response = await fetch(tryUrl, {
        method: 'HEAD',
        headers: { Referer: 'https://bflix.gs/' }
      });
      if (response.ok) {
        videoUrl = tryUrl;
        success = true;
        break;
      }
    } catch (e) { }
  }

  if (!success) throw new Error('404 not found');

  return {
    source: videoUrl,
    type: 'video/mp4',
    subtitles: [],
    headers: { Referer: 'https://bflix.gs/' }
  };
}

async function extractOkru(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT
    }
  });

  const html = await response.text();
  const dom = new JSDOM(html);
  const dataOptions = dom.window.document.querySelector('div[data-options]')?.getAttribute('data-options');
  if (!dataOptions) throw new Error('No data-options found');

  const videoMatch = dataOptions.match(/\\"videos\\":\[{(?:[^}]*?)url\\":\\"([^\\"]+)/);
  if (!videoMatch) throw new Error('No video URL found');

  const videoUrl = videoMatch[1].replace(/\\\\u0026/g, '&');

  return {
    source: videoUrl,
    type: 'video/mp4',
    subtitles: [],
    headers: {
      Referer: 'https://ok.ru/',
      'User-Agent': DEFAULT_USER_AGENT
    }
  };
}

async function extractOneupload(url) {
  const response = await fetch(url);
  const html = await response.text();
  const dom = new JSDOM(html);
  const scripts = dom.window.document.querySelectorAll('script[type*="javascript"]');

  let fileUrl = null;
  for (const script of scripts) {
    const scriptData = script.textContent;
    if (scriptData.includes('jwplayer') && scriptData.includes('sources') && scriptData.includes('file')) {
      const match = scriptData.match(/file\s*:\s*["']([^"']+)["']/);
      if (match) {
        fileUrl = match[1];
        break;
      }
    }
  }

  if (!fileUrl) throw new Error('Cannot retrieve source');

  return {
    source: fileUrl,
    type: fileUrl.includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4',
    subtitles: [],
    headers: {}
  };
}

async function extractPcloud(url) {
  const codeMatch = url.match(/code=([^&]+)/);
  const code = codeMatch?.[1];
  if (!code) throw new Error('Code not found in URL');

  const response = await fetch(`https://api.pcloud.com/getpublinkdownload?code=${code}`);
  const data = await response.json();

  const path = data.path;
  const hosts = data.hosts;
  if (!path || !hosts || hosts.length === 0) throw new Error('Download info not found');

  const downloadUrl = `https://${hosts[0]}${path}`;

  return {
    source: downloadUrl,
    type: 'video/mp4',
    subtitles: [],
    headers: {}
  };
}

async function extractPlusPomla(url) {
  const response = await fetch(url);
  const html = await response.text();

  const ajaxMatch = html.match(/\$\.ajax\s*\(\s*\{\s*url\s*:\s*["']([^"']+)["']/);
  if (!ajaxMatch) throw new Error('Ajax URL not found');

  const ajaxUrl = 'https:' + ajaxMatch[1];
  const dataResponse = await fetch(ajaxUrl, {
    headers: { Referer: url }
  });

  const data = await dataResponse.json();
  const sources = data.sources?.map(s => s.file) || [];

  if (sources.length === 0) throw new Error('No sources found');

  return {
    source: sources[0],
    type: sources[0].includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4',
    subtitles: [],
    headers: {}
  };
}

async function extractPrimeSrc(url, metadata, language = 'en') {
  const mainUrl = getBaseUrl(url);
  let apiUrl;

  if (metadata.type === 'movie') {
    apiUrl = `${mainUrl}/api/v1/s?tmdb=${metadata.tmdbId}&type=movie`;
  } else {
    apiUrl = `${mainUrl}/api/v1/s?tmdb=${metadata.tmdbId}&season=${metadata.season}&episode=${metadata.episode}&type=tv`;
  }

  const serversResponse = await fetch(apiUrl, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Accept': 'application/json',
      'Referer': `${mainUrl}/`
    }
  });
  const raw = await serversResponse.text();
  let serversData;
  try {
    serversData = JSON.parse(raw);
  } catch {
    throw new Error('PrimeSrc API did not return JSON');
  }
  const servers = serversData.servers || [];

  if (servers.length === 0) throw new Error('No servers found');

  const firstServer = servers[0];
  const linkResponse = await fetch(`${mainUrl}/api/v1/l?key=${firstServer.key}`, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Accept': 'application/json',
      'Referer': `${mainUrl}/`
    }
  });
  const linkData = await linkResponse.json();

  return extractVideo(linkData.link, metadata.type === 'movie' ? 'movie' : 'tv', language, metadata);
}

async function extractRabbitstream(url) {
  const sourceId = url.split('/').pop().split('?')[0];
  const apiUrl = `https://rabbitstream.net/ajax/v2/embed-4/sources-${sourceId}`;

  const response = await fetch(apiUrl, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Accept': '*/*',
      'X-Requested-With': 'XMLHttpRequest'
    }
  });

  let data = await response.json();

  // Handle encrypted response
  if (data.sources && typeof data.sources === 'string') {
    const keysResponse = await fetch('https://keys4.fun');
    const keysData = await keysResponse.json();
    const key = keysData.rabbitstream?.keys?.key;

    if (key) {
      const encrypted = Buffer.from(data.sources, 'base64');
      const iv = encrypted.subarray(8, 16);
      const ciphertext = encrypted.subarray(16);

      const keyBytes = Buffer.from(key, 'utf-8');
      const decrypted = aesCbcDecrypt(keyBytes, iv, ciphertext);
      const sources = JSON.parse(decrypted.toString('utf-8'));
      data = { ...data, sources: sources.sources, tracks: sources.tracks };
    }
  }

  const source = data.sources?.[0]?.file;
  if (!source) throw new Error('No source found');

  const subtitles = (data.tracks || [])
    .filter(t => t.kind === 'captions')
    .map(t => ({
      label: t.label,
      file: t.file,
      default: t.default || false
    }));

  return {
    source,
    type: source.includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4',
    subtitles,
    headers: {}
  };
}

async function extractRidoo(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': 'https://ridomovies.tv/'
    }
  });

  const html = await response.text();
  const match = html.match(/file\s*:\s*"([^"]+\.m3u8[^"]*)"/);
  const m3u8Url = match?.[1];
  if (!m3u8Url) throw new Error('Cannot extract m3u8 URL');

  return {
    source: m3u8Url,
    type: 'application/vnd.apple.mpegurl',
    subtitles: [],
    headers: {
      Referer: 'https://ridoo.net/',
      'User-Agent': DEFAULT_USER_AGENT,
      Origin: 'https://ridoo.net'
    }
  };
}

async function extractRpmvid(url) {
  const id = url.split('#')[1]?.split('&')[0];
  if (!id) throw new Error('Invalid link: missing id after #');

  const mainLink = getBaseUrl(url);
  const apiUrl = `${mainLink}/api/v1/video`;

  const hexResponse = await fetch(`${apiUrl}?id=${id}&w=1920&h=1080`, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      Referer: mainLink
    }
  });

  const hexData = await hexResponse.text();
  const key = Buffer.from('kiemtienmua911ca', 'utf-8');
  const iv = Buffer.from('1234567890oiuytr', 'utf-8');

  const encrypted = hexToBytes(hexData);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  const jsonData = JSON.parse(decrypted.toString('utf-8'));

  let finalUrl;
  let headers = {};

  if (jsonData.hls) {
    finalUrl = mainLink + jsonData.hls;
    headers = { Referer: mainLink };
  } else if (jsonData.hlsVideoTiktok) {
    let v = '';
    if (jsonData.streamingConfig) {
      try {
        const config = JSON.parse(jsonData.streamingConfig);
        v = config.adjust?.Tiktok?.params?.v || '';
      } catch (e) { }
    }
    finalUrl = mainLink + jsonData.hlsVideoTiktok + (v ? `?v=${v}` : '');
    headers = { Referer: mainLink };
  } else if (jsonData.cf) {
    let cfPath = jsonData.cf;
    if (jsonData.streamingConfig) {
      try {
        const config = JSON.parse(jsonData.streamingConfig);
        const cloudflare = config.adjust?.Cloudflare;
        if (cloudflare && !cloudflare.disabled) {
          const params = cloudflare.params;
          if (params.t && params.e) {
            cfPath += `?t=${params.t}&e=${params.e}`;
          }
        }
      } catch (e) { }
    }
    if (!cfPath.includes('?')) {
      const cfExpire = jsonData.cfExpire;
      if (cfExpire) {
        const parts = cfExpire.split('::');
        if (parts.length >= 2) {
          cfPath += `?t=${parts[0]}&e=${parts[1]}`;
        }
      }
    }
    finalUrl = cfPath;
    headers = { Referer: mainLink };
  } else {
    throw new Error('Missing video source in response');
  }

  const subtitles = [];
  const defaultSub = jsonData.defaultSubtitle?.defaultSubtitle || '';
  let alreadySelect = false;

  if (jsonData.subtitle) {
    for (const [label, file] of Object.entries(jsonData.subtitle)) {
      subtitles.push({
        label,
        file: file || '',
        default: !alreadySelect && defaultSub && label.includes(defaultSub) ? (alreadySelect = true) : false
      });
    }
  }

  return {
    source: finalUrl,
    type: 'application/vnd.apple.mpegurl',
    subtitles,
    headers
  };
}

async function extractSaveFiles(url) {
  const fileCode = url.split('/').pop().split('?')[0];
  const baseUrl = getBaseUrl(url);

  const response = await fetch(`${baseUrl}/dl?op=embed&file_code=${fileCode}&auto=0&referer=`, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT
    }
  });

  const html = await response.text();
  const dom = new JSDOM(html);
  const scripts = dom.window.document.querySelectorAll('script[type="text/javascript"]');

  let m3u8 = null;
  for (const script of scripts) {
    const scriptData = script.textContent;
    if (scriptData.includes('jwplayer') && scriptData.includes('sources') && scriptData.includes('file')) {
      const match = scriptData.match(/file\s*:\s*["']([^"']+)["']/);
      if (match) {
        m3u8 = match[1];
        break;
      }
    }
  }

  if (!m3u8) throw new Error('Stream URL not found');

  return {
    source: m3u8,
    type: 'application/vnd.apple.mpegurl',
    subtitles: [],
    headers: {}
  };
}

async function extractShareCloudy(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': 'https://sharecloudy.com/'
    }
  });

  const html = await response.text();
  const match = html.match(/file:\s*"([^"]+)"/);
  const videoUrl = match?.[1];
  if (!videoUrl) throw new Error('Cannot find video');

  return {
    source: videoUrl,
    type: videoUrl.includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4',
    subtitles: [],
    headers: { Referer: 'https://sharecloudy.com/' }
  };
}

async function extractStreamhub(url) {
  const cleanUrl = url.replace('streamhub.to/d/', 'streamhub.to/e/');
  const response = await fetch(cleanUrl);
  const html = await response.text();
  const dom = new JSDOM(html);

  const packedMatch = html.match(/(eval\(function\(p,a,c,k,e,d\)[\s\S]*?)<\/script>/);
  if (!packedMatch) throw new Error('Packed JS not found');

  const unpacked = jsUnpacker(packedMatch[1]);
  if (!unpacked) throw new Error('Unpacked is null');

  const sourcesMatch = unpacked.match(/\{sources:\[(.*?)\]/);
  const sources = [];
  if (sourcesMatch) {
    const srcMatches = sourcesMatch[1].match(/src:"([^"]+)"/g);
    if (srcMatches) {
      for (const src of srcMatches) {
        sources.push(src.match(/src:"([^"]+)"/)[1]);
      }
    }
  }

  const source = sources[0];
  if (!source) throw new Error('No source found');

  const subtitles = [];
  const tracks = dom.window.document.querySelectorAll('video > track');
  for (const track of tracks) {
    const label = track.getAttribute('label');
    const src = track.getAttribute('src');
    if (label && src && label !== 'Upload SRT') {
      subtitles.push({ label, file: src, default: false });
    }
  }
  subtitles.sort((a, b) => a.label.localeCompare(b.label));

  return {
    source,
    type: source.includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4',
    subtitles,
    headers: {}
  };
}

async function extractStreamix(url) {
  const fileCode = url.split('/').pop();
  if (!fileCode) throw new Error('File code not found');

  const baseUrl = getBaseUrl(url);
  const response = await fetch(`${baseUrl}/ajax/stream?filecode=${fileCode}`);
  const data = await response.json();

  const streamingUrl = data.streaming_url;
  if (!streamingUrl) throw new Error('Streaming URL not found');

  return {
    source: streamingUrl,
    type: 'application/vnd.apple.mpegurl',
    subtitles: [],
    headers: {}
  };
}

async function extractStreamruby(url) {
  const baseUrl = getBaseUrl(url);
  const response = await fetch(url, {
    headers: { 'User-Agent': DEFAULT_USER_AGENT }
  });

  const html = await response.text();
  const packedMatch = html.match(/(eval\(function\(p,a,c,k,e,d\)[\s\S]*?)<\/script>/);
  if (!packedMatch) throw new Error('Packed JS not found');

  const unpacked = jsUnpacker(packedMatch[1]);
  if (!unpacked) throw new Error('Unpacked is null');

  const fileMatch = unpacked.match(/file\s*:\s*["']([^"']+)["']/);
  const finalUrl = fileMatch?.[1];
  if (!finalUrl) throw new Error('No file link found');

  return {
    source: finalUrl,
    type: finalUrl.includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4',
    subtitles: [],
    headers: {}
  };
}

async function extractStreamtape(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': DEFAULT_USER_AGENT }
  });

  const html = await response.text();

  const scriptMatch = html.match(/document\.getElementById\('botlink'\)\.innerHTML\s*=\s*'([^']+)'\s*\+\s*\('([^']+)'\)\.substring\(([0-9]+)\)/);
  if (!scriptMatch) throw new Error('botlink JavaScript not found');

  const baseUrl = scriptMatch[1];
  const paramString = scriptMatch[2];
  const substringIndex = parseInt(scriptMatch[3]);

  const cleanParams = paramString.substring(substringIndex);

  const idMatch = cleanParams.match(/id=([^&]+)/);
  const expiresMatch = cleanParams.match(/expires=([^&]+)/);
  const ipMatch = cleanParams.match(/ip=([^&]+)/);
  const tokenMatch = cleanParams.match(/token=([^&]+)/);

  if (!idMatch || !expiresMatch || !ipMatch || !tokenMatch) {
    throw new Error('Could not extract video parameters');
  }

  const finalVideoUrl = `https://streamtape.com/get_video?id=${idMatch[1]}&expires=${expiresMatch[1]}&ip=${ipMatch[1]}&token=${tokenMatch[1]}&stream=1`;

  const videoResponse = await fetch(finalVideoUrl, {
    headers: { 'User-Agent': DEFAULT_USER_AGENT },
    redirect: 'manual'
  });

  const sourceUrl = videoResponse.headers.get('location') || finalVideoUrl;

  return {
    source: sourceUrl,
    type: 'application/vnd.apple.mpegurl',
    subtitles: [],
    headers: {}
  };
}

async function extractStreamUp(url) {
  const fileCode = url.split('/').pop();
  if (!fileCode) throw new Error('File code not found');

  const response = await fetch(`https://strmup.to/ajax/stream?filecode=${fileCode}`, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      Referer: `https://strmup.to/v/${fileCode}`
    }
  });

  const data = await response.json();
  const streamingUrl = data.streaming_url;
  if (!streamingUrl) throw new Error('Streaming URL not found');

  const defaultSub = data.default_sub_lang || '';
  let alreadySelect = false;
  const subtitles = (data.subtitles || []).map(sub => ({
    label: sub.language,
    file: sub.file_path,
    default: !alreadySelect && defaultSub && sub.language?.includes(defaultSub) ? (alreadySelect = true) : false
  }));

  return {
    source: streamingUrl,
    type: 'application/vnd.apple.mpegurl',
    subtitles,
    headers: {}
  };
}

async function extractStreamWish(url, refererOverride = null) {
  const baseUrl = getBaseUrl(url);
  const cleanUrl = url.replace('/f/', '/e/');
  const referer = refererOverride || baseUrl;

  const response = await fetch(cleanUrl, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      Referer: referer,
      Origin: referer
    }
  });

  const html = await response.text();
  const dom = new JSDOM(html);

  const scripts = dom.window.document.querySelectorAll('script');
  let unpackedScript = null;

  for (const script of scripts) {
    const scriptText = script.textContent;
    if (scriptText.includes('eval(function(p,a,c,k,e,d)')) {
      const unpacked = jsUnpacker(scriptText);
      if (unpacked && unpacked.includes('m3u8')) {
        unpackedScript = unpacked;
        break;
      }
    }
  }

  if (!unpackedScript) throw new Error('Cannot retrieve script');

  const hlsMatches = [...unpackedScript.matchAll(/["']?hls(\d*)["']?["']?file["']?\s*[:=]\s*["']((?:https?:\/\/|\/)[^"']+\.m3u8[^"']*)["']/g)];
  let source = null;

  for (const match of hlsMatches) {
    const priority = parseInt(match[1]) || 0;
    const url = match[2];
    if (!source || priority > (parseInt(source.priority) || 0)) {
      source = { priority, url };
    }
  }

  if (!source) {
    const fileMatch = unpackedScript.match(/file:\s*["']([^"']+\.m3u8[^"']*)["']/);
    if (fileMatch) source = { priority: 0, url: fileMatch[1] };
  }

  if (!source) throw new Error('Cannot retrieve m3u8');

  let finalSource = source.url;
  if (finalSource.startsWith('/')) {
    finalSource = `${baseUrl}${finalSource}`;
  }

  const tracksMatch = unpackedScript.match(/tracks:\s*\[(.*?)\]/s);
  const subtitles = [];
  if (tracksMatch) {
    const captionRegex = /file:\s*"([^"]+)"(?:,label:\s*"([^"]+)")?,kind:\s*"captions"/g;
    let capMatch;
    while ((capMatch = captionRegex.exec(tracksMatch[1])) !== null) {
      subtitles.push({
        label: capMatch[2] || 'Unknown',
        file: capMatch[1],
        default: false
      });
    }
  }

  return {
    source: finalSource,
    type: 'application/vnd.apple.mpegurl',
    subtitles,
    headers: {
      Referer: referer,
      Origin: referer,
      'User-Agent': DEFAULT_USER_AGENT
    }
  };
}

async function extractSupervideo(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': DEFAULT_USER_AGENT }
  });

  const html = await response.text();
  const scriptMatch = html.match(/eval\(function\(p,a,c,k,e,d\).*?<\/script>/s);
  if (!scriptMatch) throw new Error('Packed JS not found');

  const unpacked = jsUnpacker(scriptMatch[0]);
  if (!unpacked) throw new Error('Unpack failed');

  const fileMatch = unpacked.match(/file\s*:\s*["']([^"']+)["']/);
  const streamUrl = fileMatch?.[1];
  if (!streamUrl) throw new Error('Stream URL not found');

  const tracksMatch = unpacked.match(/tracks\s*:\s*\[(.*?)\]/s);
  const subtitles = [];
  if (tracksMatch) {
    const captionRegex = /file\s*:\s*"([^"]+)"\s*,\s*label\s*:\s*"([^"]+)"\s*,\s*kind\s*:\s*"captions"/g;
    let capMatch;
    while ((capMatch = captionRegex.exec(tracksMatch[1])) !== null) {
      subtitles.push({
        label: capMatch[2],
        file: capMatch[1],
        default: false
      });
    }
  }

  return {
    source: streamUrl,
    type: 'application/vnd.apple.mpegurl',
    subtitles,
    headers: {}
  };
}

async function extractTwoEmbed(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      Referer: getBaseUrl(url) + '/'
    }
  });
  const html = await response.text();
  const dom = new JSDOM(html);

  const iframeSrc = dom.window.document.querySelector('iframe')?.getAttribute('data-src');
  if (!iframeSrc) throw new Error('Cannot retrieve iframe src');

  const iframeFull = iframeSrc.startsWith('//') ? `https:${iframeSrc}` : iframeSrc;
  const referer = iframeFull.split('/').slice(0, 3).join('/');

  const id = iframeSrc.match(/id=([^&]+)/)?.[1];
  if (!id) throw new Error('Cannot extract video ID');

  const finalUrl = `https://uqloads.xyz/e/${id}`;
  return extractStreamWish(finalUrl, referer);
}

async function extractUpZur(url) {
  const response = await fetch(url);
  const html = await response.text();

  const arrayMatch = html.match(/var uHo4sc = \[(.*?)\]/);
  if (!arrayMatch) throw new Error('Array not found');

  const elements = arrayMatch[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
  const decodedString = elements.reverse().map(part => {
    return part.replace(/\\x([0-9a-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/\\u([0-9a-f]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  }).join('');

  const srcMatch = decodedString.match(/src\s*=\s*["']([^"']+)["']/);
  const streamUrl = srcMatch?.[1];
  if (!streamUrl) throw new Error('Stream URL not found');

  return {
    source: streamUrl,
    type: streamUrl.includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4',
    subtitles: [],
    headers: {}
  };
}

async function extractUqload(url) {
  const baseUrl = getBaseUrl(url);
  const response = await fetch(url);
  const html = await response.text();
  const dom = new JSDOM(html);

  const scripts = dom.window.document.querySelectorAll('script[type="text/javascript"]');
  let scriptContent = null;

  for (const script of scripts) {
    const content = script.textContent;
    if (content.includes('sources:')) {
      scriptContent = content;
      break;
    }
  }

  if (!scriptContent) throw new Error('Script with sources not found');

  const sourceMatch = scriptContent.match(/sources:\s*\["([^"]+)"\]/);
  const sourceUrl = sourceMatch?.[1];
  if (!sourceUrl) throw new Error('Sources not found');

  return {
    source: sourceUrl,
    type: sourceUrl.includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4',
    subtitles: [],
    headers: { Referer: baseUrl }
  };
}

async function extractVeev(url) {
  const match = url.match(/(?:veev|kinoger|poophq|doods)\.(?:to|pw|com)\/(?:e|d)\/([0-9a-zA-Z]+)/);
  if (!match) throw new Error('Invalid Veev URL');

  const mediaId = match[1];
  const referer = url;

  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': referer,
      'Origin': referer
    }
  });

  const html = await response.text();

  const itemsRegex = /[\.\s'](?:fc|_vvto\[[^\]]*)(?:['\]]*)?\s*[:=]\s*['"]([^'"]+)/g;
  const items = [...html.matchAll(itemsRegex)].map(m => m[1]);

  for (const item of items.reverse()) {
    let ch;
    try {
      ch = veevDecode(item);
    } catch (e) {
      ch = item;
    }

    if (ch !== item) {
      const params = new URLSearchParams({
        op: 'player_api',
        cmd: 'gi',
        file_code: mediaId,
        r: encodeURIComponent(referer),
        ch: ch,
        ie: '1'
      });

      const downloadUrl = `${url.split('/').slice(0, 3).join('/')}/dl?${params}`;
      const jsonResponse = await fetch(downloadUrl);
      const data = await jsonResponse.json();

      if (data.file?.file_status === 'OK') {
        const dv = data.file.dv[0].s;
        const sourceUrl = decodeVeevUrl(veevDecode(dv));
        return {
          source: sourceUrl,
          type: sourceUrl.includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4',
          subtitles: [],
          headers: { Referer: referer, 'User-Agent': DEFAULT_USER_AGENT }
        };
      }
    }
  }

  throw new Error('Unable to locate video');
}

function veevDecode(etext) {
  const decoded = Buffer.from(etext, 'base64').toString('utf-8');
  const processed = decoded.replace(/\|/g, '');
  const hexArray = [];
  for (let i = 0; i < processed.length; i += 2) {
    hexArray.push(processed.substr(i, 2));
  }
  const bytes = new Uint8Array(hexArray.map(h => parseInt(h, 16)));
  return new TextDecoder().decode(bytes);
}

function decodeVeevUrl(etext, tarray = [0, 1, 2, 3]) {
  let ds = etext;
  for (const t of tarray) {
    if (t === 1) {
      ds = ds.split('').reverse().join('');
    }
    const bytes = new Uint8Array(ds.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    ds = new TextDecoder().decode(bytes);
    ds = ds.replace('dXRmOA==', '');
  }
  return ds;
}

async function extractVidara(url) {
  const fileCode = url.split('/').pop();
  const baseUrl = `${url.split('/').slice(0, 3).join('/')}`;

  const response = await fetch(`${baseUrl}/api/stream?filecode=${fileCode}`);
  const data = await response.json();

  const streamingUrl = data.streaming_url;
  if (!streamingUrl) throw new Error('Streaming URL not found');

  const subtitles = (data.subtitles || []).map(sub => ({
    label: sub.language,
    file: sub.file_path,
    default: false
  }));

  return {
    source: streamingUrl,
    type: 'application/vnd.apple.mpegurl',
    subtitles,
    headers: {}
  };
}

async function extractVideasy(url) {
  const client = await fetch(url);
  const encData = await client.text();

  const tmdbId = url.match(/tmdbId=([^&]+)/)?.[1] || '';

  const decResponse = await fetch('https://enc-dec.app/api/dec-videasy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: encData, id: tmdbId })
  });

  const decData = await decResponse.json();
  if (!decData.result) throw new Error('Videasy decrypt API returned no result');
  let result;
  try {
    result = JSON.parse(decData.result);
  } catch {
    throw new Error('Videasy decrypt payload is not valid JSON');
  }
  const sources = result.sources;
  const subtitles = (result.subtitles || []).map(track => ({
    label: track.lang || 'Unknown',
    file: track.url
  }));

  if (sources && sources.length > 0) {
    // VideasyExtractor.kt: Reyna (primewire) + Cypher (moviebox) use MP4
    const isMp4Server = url.includes('/moviebox/') || url.includes('/primewire/');
    return {
      source: sources[0].url,
      type: isMp4Server ? 'video/mp4' : 'application/vnd.apple.mpegurl',
      subtitles,
      headers: { Referer: 'https://player.videasy.net/' }
    };
  }

  throw new Error('No video source found');
}

async function extractVideoSibNet(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': 'https://video.sibnet.ru/'
    }
  });

  const html = await response.text();
  const dom = new JSDOM(html);
  const scripts = dom.window.document.querySelectorAll('script');

  for (const script of scripts) {
    const content = script.textContent;
    if (content.includes('player.src')) {
      const match = content.match(/src:\s*"([^"]+)"/);
      if (match) {
        const relativeUrl = match[1];
        const absoluteUrl = relativeUrl.startsWith('/')
          ? `https://video.sibnet.ru${relativeUrl}`
          : relativeUrl;

        return {
          source: absoluteUrl,
          type: 'video/mp4',
          subtitles: [],
          headers: {
            Referer: 'https://video.sibnet.ru/',
            'User-Agent': DEFAULT_USER_AGENT
          }
        };
      }
    }
  }

  throw new Error('Could not find video source');
}

async function extractVidflix(url) {
  const response = await fetch(url, {
    headers: {
      'Referer': url.replace('/api/', '/'),
      'User-Agent': DEFAULT_USER_AGENT
    }
  });

  const data = await response.json();
  return extractRpmvid(data.video_url, {
    subtitles: data.subtitles.map(sub => ({
      label: sub.label,
      file: sub.url,
      default: sub.default || false
    }))
  });
}

async function extractVidGuard(url) {
  const fetchUrl = url.startsWith('http') ? url : `https:${url}`;
  const response = await fetch(fetchUrl);
  const html = await response.text();

  const scriptMatch = html.match(/eval\(function\(p,a,c,k,e,d\).*?<\/script>/s);
  if (!scriptMatch) throw new Error('No eval script found');

  const packedScript = scriptMatch[0];
  const unpacked = jsUnpacker(packedScript);
  if (!unpacked) throw new Error('Failed to unpack script');

  const urlEncoded = unpacked.match(/window\.svg=\{"stream":"([^"]+)"/)?.[1];
  if (!urlEncoded) throw new Error('Stream URL not found');

  const finalUrl = sigDecodeVidGuard(urlEncoded);

  return {
    source: finalUrl,
    type: 'application/vnd.apple.mpegurl',
    subtitles: [],
    headers: { Referer: 'https://vidguard.to/' }
  };
}

function sigDecodeVidGuard(url) {
  const sigMatch = url.match(/sig=([^&]+)/);
  if (!sigMatch) return url;

  let sig = sigMatch[1];
  let decodedSig = '';
  for (let i = 0; i < sig.length; i += 2) {
    decodedSig += String.fromCharCode(parseInt(sig.substr(i, 2), 16) ^ 2);
  }

  const padding = decodedSig.length % 4 === 2 ? '==' : decodedSig.length % 4 === 3 ? '=' : '';
  const base64Decoded = Buffer.from(decodedSig + padding, 'base64').toString('utf-8');
  let processed = base64Decoded.slice(0, -5).split('').reverse().join('');

  const chars = processed.split('');
  for (let i = 0; i < chars.length; i += 2) {
    if (i + 1 < chars.length) {
      [chars[i], chars[i + 1]] = [chars[i + 1], chars[i]];
    }
  }

  const finalSig = chars.join('').slice(0, -5);
  return url.replace(sig, finalSig);
}

async function extractVidHide(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': url,
      'Origin': url
    }
  });

  const html = await response.text();
  const packedMatch = html.match(/(eval\(function\(p,a,c,k,e,d\)[\s\S]*?)<\/script>/);
  if (!packedMatch) throw new Error('Packed JS not found');

  const unpacked = jsUnpacker(packedMatch[1]);
  if (!unpacked) throw new Error('Failed to unpack');

  const links = {};
  const linkRegex = /["'](hls\d+)["']\s*:\s*["'](.*?)["']/g;
  let match;
  while ((match = linkRegex.exec(unpacked)) !== null) {
    links[match[1]] = match[2];
  }

  const finalUrl = links.hls4 || links.hls2;
  if (!finalUrl) throw new Error('No HLS link found');

  const completeUrl = finalUrl.startsWith('/')
    ? `${url.split('/').slice(0, 3).join('/')}${finalUrl}`
    : finalUrl;

  return {
    source: completeUrl,
    type: 'application/vnd.apple.mpegurl',
    subtitles: [],
    headers: { Referer: url }
  };
}

async function extractVidLink(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': 'https://vidlink.pro/'
    }
  });

  const html = await response.text();

  const apiMatch = html.match(/\/api\/b\/[^"']+/);
  if (apiMatch) {
    const apiUrl = `https://vidlink.pro${apiMatch[0]}`;
    const apiResponse = await fetch(apiUrl);
    const data = await apiResponse.json();

    if (data.stream && data.stream.playlist) {
      const captions = (data.stream.captions || []).map(cap => ({
        label: cap.language,
        file: cap.id,
        default: false
      }));

      return {
        source: data.stream.playlist,
        type: 'application/vnd.apple.mpegurl',
        subtitles: captions,
        headers: { Referer: 'https://vidlink.pro/' }
      };
    }
  }

  throw new Error('Stream not found');
}

async function extractVidMoLy(url) {
  const redirectUrl = url.replace('.me/', '.to/');
  const response = await fetch(redirectUrl, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': 'https://vidmoly.to/'
    }
  });

  const html = await response.text();
  const match = html.match(/sources:\s*\[\{file:\s*"([^"]+)"/);

  if (!match) throw new Error('Could not find HLS source');

  return {
    source: match[1],
    type: 'application/vnd.apple.mpegurl',
    subtitles: [],
    headers: {
      Referer: 'https://vidmoly.to/',
      'User-Agent': DEFAULT_USER_AGENT
    }
  };
}

async function extractVidnest(url) {
  const response = await fetch(url);
  const html = await response.text();
  const dom = new JSDOM(html);
  const scripts = dom.window.document.querySelectorAll('script[type="text/javascript"]');

  let m3u8 = null;
  let subtitles = [];

  for (const script of scripts) {
    const scriptData = script.textContent;
    if (scriptData.includes('jwplayer') && scriptData.includes('sources')) {
      const fileMatch = scriptData.match(/file\s*:\s*["']([^"']+)["']/);
      if (fileMatch) {
        m3u8 = fileMatch[1];
        subtitles = extractVidnestSubtitles(scriptData);
        break;
      }
    }
  }

  if (!m3u8) throw new Error('Stream URL not found');

  return {
    source: m3u8,
    type: 'application/vnd.apple.mpegurl',
    subtitles,
    headers: {}
  };
}

function extractVidnestSubtitles(text) {
  const tracksMatch = text.match(/tracks\s*:\s*\[(.*?)\]/s);
  if (!tracksMatch) return [];

  const tracksContent = tracksMatch[1];
  const subtitles = [];
  const objRegex = /\{(.*?)\}/gs;
  let match;

  while ((match = objRegex.exec(tracksContent)) !== null) {
    const obj = match[1];
    const kind = obj.match(/kind\s*:\s*"([^"]+)"/)?.[1];

    if (kind === 'captions') {
      const file = obj.match(/file\s*:\s*"([^"]+)"/)?.[1];
      const label = obj.match(/label\s*:\s*"([^"]+)"/)?.[1];
      const isDefault = obj.includes('default: true');

      if (file && label) {
        const urlMatch = file.match(/https:\/\/[^\s"']+/);
        if (urlMatch) {
          subtitles.push({
            file: urlMatch[0],
            label: label,
            default: isDefault
          });
        }
      }
    }
  }

  return subtitles;
}

async function extractVidora(url) {
  const referer = `${getBaseUrl(url)}/`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': referer
    }
  });

  const html = await response.text();
  const packedMatch = html.match(/(eval\(function\(p,a,c,k,e,d\)[\s\S]*?)<\/script>/);

  if (!packedMatch) throw new Error('Packed JS not found');

  const unpacked = jsUnpacker(packedMatch[1]);
  if (!unpacked) throw new Error('Failed to unpack');

  const fileMatch = unpacked.match(/file\s*:\s*["']([^"']+)["']/);
  if (!fileMatch) throw new Error('No source found');

  return {
    source: fileMatch[1],
    type: fileMatch[1].includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4',
    subtitles: [],
    headers: {
      Referer: referer,
      'User-Agent': DEFAULT_USER_AGENT
    }
  };
}

async function extractVidoza(url) {
  const response = await fetch(url);
  const html = await response.text();
  const dom = new JSDOM(html);
  const source = dom.window.document.querySelector('source');

  if (!source) throw new Error('No video source found');

  return {
    source: source.getAttribute('src'),
    type: 'video/mp4',
    subtitles: [],
    headers: {}
  };
}

async function extractVidplay(url) {
  const keyUrl = 'https://raw.githubusercontent.com/Ciarands/vidsrc-keys/main/keys.json';
  const keysResponse = await fetch(keyUrl);
  const keys = await keysResponse.json();

  const id = url.split('/').pop().split('?')[0];
  const encId = encodeVidplay(keys.encrypt[1], id);
  const h = encodeVidplay(keys.encrypt[2], id);

  const mediaUrl = `${url.split('/').slice(0, 3).join('/')}/mediainfo/${encId}?${url.split('?')[1]}&autostart=true&ads=0&h=${h}`;

  const response = await fetch(mediaUrl, {
    headers: {
      'Referer': url,
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json'
    }
  });

  let data = await response.json();

  if (typeof data.result === 'string') {
    const decrypted = decryptVidplay(keys.decrypt[1], data.result);
    data = JSON.parse(decrypted);
  }

  const source = data.result?.sources?.[0]?.file;
  if (!source) throw new Error('Can\'t retrieve source');

  const subtitles = (data.result?.tracks || [])
    .filter(t => t.kind === 'captions')
    .map(t => ({
      label: t.label || 'Unknown',
      file: t.file
    }));

  return {
    source,
    type: source.includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4',
    subtitles,
    headers: {}
  };
}

function encodeVidplay(key, vId) {
  const decodedId = decodeDataVidplay(key, vId);
  const encoded = Buffer.from(decodedId).toString('base64')
    .replace(/\//g, '_')
    .replace(/\+/g, '-');
  return encoded;
}

function decodeDataVidplay(key, data) {
  const keyBytes = Buffer.from(key, 'utf-8');
  const s = new Uint8Array(256);
  for (let i = 0; i < 256; i++) s[i] = i;

  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + keyBytes[i % keyBytes.length]) & 0xff;
    [s[i], s[j]] = [s[j], s[i]];
  }

  const result = Buffer.alloc(data.length);
  let i = 0;
  let k = 0;
  for (let idx = 0; idx < data.length; idx++) {
    i = (i + 1) & 0xff;
    k = (k + s[i]) & 0xff;
    [s[i], s[k]] = [s[k], s[i]];
    const t = (s[i] + s[k]) & 0xff;
    result[idx] = data.charCodeAt(idx) ^ s[t];
  }
  return result;
}

function decryptVidplay(key, data) {
  const decoded = Buffer.from(data, 'base64');
  const decrypted = rc4Decrypt(key, decoded);
  return decodeURIComponent(new TextDecoder().decode(decrypted));
}

async function extractVidPly(url) {
  const videoUrl = url.replace('/d/', '/e/');
  const response = await fetch(videoUrl);
  const html = await response.text();

  const passMd5Match = html.match(/\$\.get\('(\/pass_md5\/[^']*)'/);
  const tokenMatch = html.match(/return\s*[^?]+\?token=([^&]+)&expiry=/);

  if (!passMd5Match || !tokenMatch) throw new Error('Could not extract parameters');

  const passMd5Endpoint = passMd5Match[1];
  const token = tokenMatch[1];

  const baseUrl = 'https://vidply.com';
  const videoSourceResponse = await fetch(`${baseUrl}${passMd5Endpoint}`, {
    headers: { Referer: baseUrl }
  });

  let baseVideoUrl = await videoSourceResponse.text();
  baseVideoUrl = baseVideoUrl.trim();

  let finalUrl;
  if (baseVideoUrl.endsWith('~')) {
    const randomStr = Math.random().toString(36).substring(2, 12);
    finalUrl = `${baseVideoUrl}${randomStr}?token=${token}&expiry=${Date.now()}`;
  } else {
    finalUrl = baseVideoUrl;
  }

  return {
    source: finalUrl,
    type: finalUrl.includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4',
    subtitles: [],
    headers: {
      Referer: baseUrl,
      'User-Agent': DEFAULT_USER_AGENT
    }
  };
}

async function extractVidrock(url) {
  const serverName = url.split('#')[1];
  const apiLink = url.split('#')[0];

  const response = await fetch(apiLink);
  const data = await response.json();

  let serverEntry;
  if (serverName) {
    serverEntry = Object.entries(data).find(([key]) => key.toLowerCase() === serverName.toLowerCase());
  } else {
    serverEntry = Object.entries(data).find(([, value]) => value.url && value.url.length > 0);
  }

  if (!serverEntry) throw new Error('No video sources found');

  const actualServerName = serverEntry[0];
  let videoUrl = serverEntry[1].url;
  let type = 'application/vnd.apple.mpegurl';

  if (actualServerName.toLowerCase() === 'atlas') {
    try {
      const qualitiesResponse = await fetch(videoUrl);
      const qualities = await qualitiesResponse.json();
      const highest = qualities.reduce((max, q) => q.resolution > max.resolution ? q : max, { resolution: 0 });
      if (highest.url) {
        videoUrl = highest.url;
        type = 'video/mp4';
      }
    } catch (e) {
      // Fall back to original
    }
  }

  return {
    source: videoUrl,
    type,
    subtitles: [],
    headers: {
      Referer: 'https://vidrock.net/',
      Origin: 'https://vidrock.net'
    }
  };
}

async function extractVidsonic(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': DEFAULT_USER_AGENT }
  });

  const html = await response.text();
  const encodedMatch = html.match(/const\s+\w+\s*=\s*'([a-fA-F0-9|]{50,})';/);

  if (!encodedMatch) throw new Error('Could not find encoded m3u8 string');

  const encodedStr = encodedMatch[1].replace(/\|/g, '');
  let asciiBuilder = '';

  for (let i = 0; i < encodedStr.length; i += 2) {
    const hexPair = encodedStr.substring(i, i + 2);
    asciiBuilder += String.fromCharCode(parseInt(hexPair, 16));
  }

  const sourceUrl = asciiBuilder.split('').reverse().join('');

  return {
    source: sourceUrl,
    type: 'application/vnd.apple.mpegurl',
    subtitles: [],
    headers: {
      Referer: 'https://vidsonic.net/',
      Origin: 'https://vidsonic.net'
    }
  };
}

async function extractVidsrcNet(url) {
  const response = await fetch(url);
  const html = await response.text();
  const dom = new JSDOM(html);

  const iframeSrc = dom.window.document.querySelector('iframe#player_iframe')?.getAttribute('src');
  if (!iframeSrc) throw new Error('Can\'t retrieve iframe');

  const fullIframeUrl = iframeSrc.startsWith('//') ? `https:${iframeSrc}` : iframeSrc;
  const iframeResponse = await fetch(fullIframeUrl, { headers: { Referer: url } });
  const iframeHtml = await iframeResponse.text();

  const prorcpMatch = iframeHtml.match(/src: '(\/prorcp\/.*?)'/);
  if (!prorcpMatch) throw new Error('Can\'t retrieve prorcp');

  const prorcpUrl = `${fullIframeUrl.split('/').slice(0, 3).join('/')}${prorcpMatch[1]}`;
  const scriptResponse = await fetch(prorcpUrl, { headers: { Referer: fullIframeUrl } });
  const script = await scriptResponse.text();

  const playerIdMatch = script.match(/Playerjs.*file: ([a-zA-Z0-9]*?) ,/);
  let decryptedData;

  if (playerIdMatch && playerIdMatch[1]) {
    const playerId = playerIdMatch[1];
    const encryptedMatch = new RegExp(`<div id="${playerId}" style="display:none;">\\s*(.*?)\\s*</div>`).exec(script);
    if (encryptedMatch) {
      decryptedData = decryptVidsrcNet(playerId, encryptedMatch[1]);
    }
  }

  if (!decryptedData) {
    const directMatch = script.match(/Playerjs.*file: "([^"]*?)" ,/);
    decryptedData = directMatch?.[1];
  }

  if (!decryptedData) throw new Error('Can\'t retrieve file');

  const streamUrl = decryptedData.split(' or ')[0].replace(/\{[a-z]\d+\}/g, 'quibblezoomfable.com');

  const subtitlesMatch = script.match(/default_subtitles\s*=\s*["']([^"']+)["']/);
  const subtitles = [];

  if (subtitlesMatch && subtitlesMatch[1]) {
    const baseUrl = `${fullIframeUrl.split('/').slice(0, 3).join('/')}`;
    const items = subtitlesMatch[1].split(',');

    for (const item of items) {
      const langMatch = item.match(/\[([^\]]+)\]/);
      const urlMatch = item.match(/\](.*)/);

      if (langMatch && urlMatch && urlMatch[1].startsWith('/')) {
        subtitles.push({
          label: langMatch[1],
          file: `${baseUrl}${urlMatch[1]}`,
          default: false
        });
      }
    }
  }

  return {
    source: streamUrl,
    type: 'application/vnd.apple.mpegurl',
    subtitles,
    headers: { Referer: fullIframeUrl }
  };
}

function decryptVidsrcNet(id, encrypted) {
  const decryptionMap = {
    'NdonQLf1Tzyx7bMG': (a) => {
      const b = 3;
      const c = [];
      for (let d = 0; d < a.length; d += b) {
        c.push(a.substring(d, Math.min(d + b, a.length)));
      }
      return c.reverse().join('');
    },
    'sXnL9MQIry': (a) => {
      const b = "pWB9V)[*4I`nJpp?ozyB~dbr9yt!_n4u";
      const d = a.match(/.{1,2}/g).map(hex => String.fromCharCode(parseInt(hex, 16))).join('');
      let c = '';
      for (let e = 0; e < d.length; e++) {
        c += String.fromCharCode(d.charCodeAt(e) ^ b.charCodeAt(e % b.length));
      }
      let e = '';
      for (const ch of c) {
        e += String.fromCharCode(ch.charCodeAt(0) - 3);
      }
      return Buffer.from(e, 'base64').toString('utf-8');
    },
    'IhWrImMIGL': (a) => {
      const b = a.split('').reverse().join('');
      const c = b.split('').map(ch => {
        if (ch >= 'a' && ch <= 'm') return String.fromCharCode(ch.charCodeAt(0) + 13);
        if (ch >= 'n' && ch <= 'z') return String.fromCharCode(ch.charCodeAt(0) - 13);
        if (ch >= 'A' && ch <= 'M') return String.fromCharCode(ch.charCodeAt(0) + 13);
        if (ch >= 'N' && ch <= 'Z') return String.fromCharCode(ch.charCodeAt(0) - 13);
        return ch;
      }).join('');
      const d = c.split('').reverse().join('');
      return Buffer.from(d, 'base64').toString('utf-8');
    }
  };

  const decryptor = decryptionMap[id];
  if (decryptor) {
    return decryptor(encrypted);
  }

  throw new Error(`Encryption type not implemented: ${id}`);
}

async function extractVidsrcRu(url) {
  const response = await fetch(url);
  const html = await response.text();

  const m3u8Match = html.match(/https?:\/\/[^\s"']+\.m3u8[^\s"']*/);
  if (m3u8Match) {
    return {
      source: m3u8Match[0],
      type: 'application/vnd.apple.mpegurl',
      subtitles: [],
      headers: {}
    };
  }

  throw new Error('No stream found');
}

async function extractVidsrcTo(url) {
  const response = await fetch(url);
  const html = await response.text();
  const dom = new JSDOM(html);

  const mediaId = dom.window.document.querySelector('ul.episodes li a')?.getAttribute('data-id');
  if (!mediaId) throw new Error('Can\'t retrieve media ID');

  const keysResponse = await fetch('https://raw.githubusercontent.com/Ciarands/vidsrc-keys/main/keys.json');
  const keys = await keysResponse.json();

  const sourcesResponse = await fetch(`${url.split('/').slice(0, 3).join('/')}/ajax/embed/episode/${mediaId}/sources?token=${encodeVidplay(keys.encrypt[0], mediaId)}`);
  const sourcesData = await sourcesResponse.json();

  if (!sourcesData.result || sourcesData.result.length === 0) {
    throw new Error('Can\'t retrieve sources');
  }

  let video = null;
  for (const source of sourcesData.result) {
    try {
      const embedResponse = await fetch(`${url.split('/').slice(0, 3).join('/')}/ajax/embed/source/${source.id}?token=${encodeVidplay(keys.encrypt[0], source.id)}`);
      const embedData = await embedResponse.json();

      const finalUrl = decryptVidsrcTo(keys.decrypt[0], embedData.result.url);

      if (finalUrl !== embedData.result.url) {
        if (source.title === 'F2Cloud' || source.title === 'Vidplay') {
          video = await extractVidplay(finalUrl);
        } else if (source.title === 'Filemoon') {
          video = await extractFilemoon(finalUrl);
        } else {
          video = await extractDefault(finalUrl);
        }
        break;
      }
    } catch (e) {
      continue;
    }
  }

  if (!video) throw new Error('Failed to extract from all sources');

  const subtitlesResponse = await fetch(`${url.split('/').slice(0, 3).join('/')}/ajax/embed/episode/${mediaId}/subtitles`);
  const subtitlesData = await subtitlesResponse.json();

  video.subtitles = subtitlesData.map(sub => ({
    label: sub.label,
    file: sub.file,
    default: false
  }));

  return video;
}

function decryptVidsrcTo(key, encUrl) {
  const data = Buffer.from(encUrl, 'base64');
  const decrypted = rc4Decrypt(key, data);
  return decodeURIComponent(new TextDecoder().decode(decrypted));
}

async function extractVidzee(url) {
  const masterKey = await getVidzeeMasterKey();
  if (!masterKey) throw new Error('Failed to get Vidzee master key');

  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Origin': 'https://player.vidzee.wtf',
      'Referer': 'https://player.vidzee.wtf/'
    }
  });

  const data = await response.json();
  const urlArray = data.url;

  if (!urlArray || urlArray.length === 0) throw new Error('No URLs found');

  const content = urlArray[0];
  const encryptedLink = content.link;
  if (!encryptedLink) throw new Error('Empty encrypted link');

  const decryptedUrl = decryptVidzee(encryptedLink, masterKey);
  if (!decryptedUrl) throw new Error('Failed to decrypt link');

  const isDukeServer = url.includes('sr=1');
  const subtitles = (data.tracks || []).map(track => ({
    label: track.lang || 'Unknown',
    file: track.url
  }));

  return {
    source: decryptedUrl,
    type: isDukeServer ? 'video/mp4' : 'application/vnd.apple.mpegurl',
    subtitles,
    headers: {
      Referer: 'https://player.vidzee.wtf/',
      Origin: 'https://player.vidzee.wtf/',
      'User-Agent': DEFAULT_USER_AGENT
    }
  };
}

async function getVidzeeMasterKey() {
  const response = await fetch('https://core.vidzee.wtf/api-key', {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Origin': 'https://player.vidzee.wtf',
      'Referer': 'https://player.vidzee.wtf/'
    }
  });

  const b64Data = await response.text();
  const data = Buffer.from(b64Data, 'base64');

  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const ciphertext = data.subarray(28);

  const staticPass = 'b3f2a9d4c6e1f8a7b';
  const key = crypto.createHash('sha256').update(staticPass).digest();

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}

/** VidzeeExtractor.kt decryptLink — AES/CBC, key zero-padded to 32 bytes */
function decryptVidzee(encLink, masterKey) {
  try {
    const decodedRaw = Buffer.from(encLink, 'base64').toString('utf8');
    const parts = decodedRaw.split(':');
    if (parts.length < 2) return null;
    const iv = Buffer.from(parts[0], 'base64');
    const ciphertext = Buffer.from(parts[1], 'base64');
    const keyBytes = Buffer.from(masterKey, 'utf8');
    const paddedKey = Buffer.alloc(32);
    keyBytes.copy(paddedKey, 0, 0, Math.min(32, keyBytes.length));
    const decipher = crypto.createDecipheriv('aes-256-cbc', paddedKey, iv);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    return null;
  }
}

async function extractVidzy(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT
    }
  });

  const html = await response.text();
  const packedMatch = html.match(/\}\s*\('.*?'\.split\('\|'\)/);

  if (!packedMatch) throw new Error('Packed JS not found');

  const unpacked = jsUnpacker(packedMatch[0]);
  if (!unpacked) throw new Error('Failed to unpack');

  const srcMatch = unpacked.match(/src\s*:\s*["']([^"']+)["']/);
  if (!srcMatch) throw new Error('No src found');

  const subtitles = extractVidzySubtitles(unpacked);

  return {
    source: srcMatch[1],
    type: srcMatch[1].includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4',
    subtitles,
    headers: { Referer: 'https://vidzy.org/' }
  };
}

function extractVidzySubtitles(text) {
  const loadTracksMatch = text.match(/loadTracks\s*\(\s*\[(.*?)]\s*\)/s);
  if (!loadTracksMatch) return [];

  const tracksContent = loadTracksMatch[1];
  const subtitles = [];
  const objRegex = /\{(.*?)\}/gs;
  let match;

  while ((match = objRegex.exec(tracksContent)) !== null) {
    const obj = match[1];
    const label = obj.match(/label:'([^']+)'/)?.[1];
    const file = obj.match(/src:'([^']+)'/)?.[1];
    const isDefault = obj.includes('default:true');

    if (label && file && file.startsWith('http')) {
      subtitles.push({
        file,
        label,
        default: isDefault
      });
    }
  }

  return subtitles;
}

async function extractVixcloud(url, language) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': 'https://vixcloud.co/',
      'Accept': 'text/html'
    }
  });

  const html = await response.text();
  const dom = new JSDOM(html);
  const script = dom.window.document.querySelector('script')?.textContent || '';

  let videoJson = script.split('window.video = ')[1]?.split(';')[0] || '';
  videoJson = videoJson.replace(/'/g, '"');

  const videoData = JSON.parse(videoJson);
  const videoId = videoData.id;

  const tokenMatch = script.match(/token:\s*"([^"]+)"/);
  const expiresMatch = script.match(/expires:\s*"([^"]+)"/);

  const params = new URLSearchParams();
  if (tokenMatch) params.append('token', tokenMatch[1]);
  if (expiresMatch) params.append('expires', expiresMatch[1]);
  if (script.includes('b=1')) params.append('b', '1');
  if (script.includes('window.canPlayFHD = true')) params.append('h', '1');
  if (language) params.append('language', language);

  const playlistUrl = `https://vixcloud.co/playlist/${videoId}?${params}`;

  const playlistResponse = await fetch(playlistUrl, {
    headers: {
      Referer: 'https://vixcloud.co/',
      'User-Agent': DEFAULT_USER_AGENT
    }
  });

  let playlistContent = await playlistResponse.text();

  if (language) {
    const lines = playlistContent.split('\n');
    const processedLines = [];

    for (let line of lines) {
      if (line.startsWith('#EXT-X-MEDIA:TYPE=SUBTITLES')) {
        const trackName = line.match(/NAME="([^"]+)"/)?.[1] || '';
        const trackLang = line.match(/LANGUAGE="([^"]+)"/)?.[1] || '';

        line = line.replace(/DEFAULT=YES/i, 'DEFAULT=NO')
          .replace(/AUTOSELECT=YES/i, 'AUTOSELECT=NO');

        const isForced = trackName.toLowerCase().includes('forced') ||
          trackLang.toLowerCase().includes('forced') ||
          line.includes('FORCED=YES');
        const isRightLanguage = trackLang.toLowerCase() === language.toLowerCase() ||
          trackName.toLowerCase().includes(language.toLowerCase());

        if (isForced && isRightLanguage) {
          line = line.replace(/DEFAULT=NO/i, 'DEFAULT=YES')
            .replace(/AUTOSELECT=NO/i, 'AUTOSELECT=YES');
        }
      }

      if (line.startsWith('#') && line.includes('URI="')) {
        line = line.replace(/URI="([^"]+)"/, (match, url) => {
          if (!url.startsWith('http') && !url.startsWith('data:')) {
            const baseUrl = playlistResponse.url;
            const resolved = new URL(url, baseUrl).href;
            return `URI="${resolved}"`;
          }
          return match;
        });
      }

      processedLines.push(line);
    }

    playlistContent = processedLines.join('\n');
    const base64Manifest = Buffer.from(playlistContent).toString('base64');

    return {
      source: `data:application/vnd.apple.mpegurl;base64,${base64Manifest}`,
      type: 'application/vnd.apple.mpegurl',
      subtitles: [],
      headers: {
        Referer: 'https://vixcloud.co/',
        'User-Agent': DEFAULT_USER_AGENT,
        'Accept-Language': language === 'en' ? 'en-US,en;q=0.9' : 'it-IT,it;q=0.9',
        Cookie: `language=${language}`
      }
    };
  }

  return {
    source: playlistUrl,
    type: 'application/vnd.apple.mpegurl',
    subtitles: [],
    headers: {
      Referer: 'https://vixcloud.co/',
      'User-Agent': DEFAULT_USER_AGENT
    }
  };
}

async function extractVixSrc(url, language) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': 'https://vixsrc.to/'
    }
  });

  const html = await response.text();
  const dom = new JSDOM(html);
  const script = dom.window.document.querySelector('script')?.textContent || '';

  let videoId = script.match(/id:\s*'([^']+)'/)?.[1];
  if (!videoId) {
    const wv = script.match(/window\.video\s*=\s*\{([^}]+)\}/s);
    if (wv) videoId = wv[1].match(/id:\s*['"]([^'"]+)/)?.[1];
  }
  if (!videoId) {
    videoId = script.match(/playlist\/([^/?'"]+)/)?.[1];
  }
  const token = script.match(/'token':\s*'([^']+)'/)?.[1];
  const expires = script.match(/'expires':\s*'([^']+)'/)?.[1];

  if (!videoId) throw new Error('Could not extract video ID');

  const params = new URLSearchParams();
  if (token) params.append('token', token);
  if (expires) params.append('expires', expires);
  if (script.includes('b=1')) params.append('b', '1');
  if (script.includes('window.canPlayFHD = true')) params.append('h', '1');
  if (language) params.append('lang', language);

  const playlistUrl = `https://vixsrc.to/playlist/${videoId}?${params}`;

  const playlistResponse = await fetch(playlistUrl, {
    headers: {
      Referer: 'https://vixsrc.to/',
      'User-Agent': DEFAULT_USER_AGENT
    }
  });

  let playlistContent = await playlistResponse.text();

  if (language) {
    const lines = playlistContent.split('\n');
    const processedLines = [];

    for (let line of lines) {
      if (line.startsWith('#EXT-X-MEDIA:TYPE=AUDIO')) {
        line = line.replace(/DEFAULT=YES/i, 'DEFAULT=NO')
          .replace(/AUTOSELECT=YES/i, 'AUTOSELECT=NO');

        const isTargetAudio = line.toLowerCase().includes(`language="${language}"`) ||
          (language === 'it' && line.toLowerCase().includes('italian')) ||
          (language === 'es' && (line.toLowerCase().includes('spanish') || line.toLowerCase().includes('español'))) ||
          (language === 'en' && line.toLowerCase().includes('english'));

        if (isTargetAudio) {
          line = line.replace(/DEFAULT=NO/i, 'DEFAULT=YES')
            .replace(/AUTOSELECT=NO/i, 'AUTOSELECT=YES');
        }
      } else if (line.startsWith('#EXT-X-MEDIA:TYPE=SUBTITLES')) {
        const trackName = line.match(/NAME="([^"]+)"/)?.[1] || '';
        const trackLang = line.match(/LANGUAGE="([^"]+)"/)?.[1] || '';

        line = line.replace(/DEFAULT=YES/i, 'DEFAULT=NO')
          .replace(/AUTOSELECT=YES/i, 'AUTOSELECT=NO');

        const isForced = trackName.toLowerCase().includes('forced') ||
          trackLang.toLowerCase().includes('forced') ||
          line.includes('FORCED=YES');
        const isRightLanguage = trackLang.toLowerCase() === language.toLowerCase() ||
          trackName.toLowerCase().includes(language.toLowerCase()) ||
          (language === 'es' && (trackName.toLowerCase().includes('spanish') || trackName.toLowerCase().includes('español'))) ||
          (language === 'it' && trackName.toLowerCase().includes('italian')) ||
          (language === 'en' && trackName.toLowerCase().includes('english'));

        if (isForced && isRightLanguage) {
          line = line.replace(/DEFAULT=NO/i, 'DEFAULT=YES')
            .replace(/AUTOSELECT=NO/i, 'AUTOSELECT=YES');
        }
      }

      processedLines.push(line);
    }

    playlistContent = processedLines.join('\n');
    const base64Manifest = Buffer.from(playlistContent).toString('base64');

    return {
      source: `data:application/vnd.apple.mpegurl;base64,${base64Manifest}`,
      type: 'application/vnd.apple.mpegurl',
      subtitles: [],
      headers: {
        Referer: 'https://vixsrc.to/',
        'User-Agent': DEFAULT_USER_AGENT
      }
    };
  }

  return {
    source: playlistUrl,
    type: 'application/vnd.apple.mpegurl',
    subtitles: [],
    headers: {
      Referer: 'https://vixsrc.to/',
      'User-Agent': DEFAULT_USER_AGENT
    }
  };
}

async function extractVoe(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': url
    }
  });

  const html = await response.text();

  const baseMatch = html.match(/https:\/\/([a-zA-Z0-9.-]+)(?:\/[^'"]*)?/);
  if (!baseMatch) throw new Error('Base URL not found');

  const redirectBaseUrl = `https://${baseMatch[1]}/`;

  const secondResponse = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': redirectBaseUrl
    }
  });

  const finalHtml = await secondResponse.text();

  const scriptMatch = finalHtml.match(/<script[^>]*type="application\/json"[^>]*>([^<]+)<\/script>/);
  const encodedString = scriptMatch?.[1] || '';

  const decrypted = JSON.parse(encodedString);

  const m3u8 = decrypted.source;
  const subtitles = (decrypted.captions || []).map(caption => ({
    label: caption.label,
    file: caption.file,
    default: caption.default || false
  }));

  return {
    source: m3u8,
    type: 'application/vnd.apple.mpegurl',
    subtitles,
    headers: {}
  };
}

async function extractYourUpload(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      'Referer': 'https://www.yourupload.com/'
    }
  });

  const html = await response.text();
  const dom = new JSDOM(html);

  // Look for jwplayerOptions in script tags
  const scripts = dom.window.document.querySelectorAll('script');
  let videoUrl = null;

  for (const script of scripts) {
    const content = script.textContent;
    if (content.includes('jwplayerOptions')) {
      const match = content.match(/file:\s*'([^']+\.(?:m3u8|mp4))'/);
      if (match) {
        videoUrl = match[1];
        break;
      }
    }
  }

  if (!videoUrl) throw new Error('No video URL found');

  return {
    source: videoUrl,
    type: videoUrl.includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4',
    subtitles: [],
    headers: {
      Referer: 'https://www.yourupload.com/',
      'User-Agent': DEFAULT_USER_AGENT
    }
  };
}

async function extractDefault(url) {
  const response = await fetch(url);
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/vnd.apple.mpegurl') || url.includes('.m3u8')) {
    return {
      source: url,
      type: 'application/vnd.apple.mpegurl',
      subtitles: [],
      headers: {}
    };
  } else if (contentType.includes('video/') || url.includes('.mp4') || url.includes('.webm')) {
    return {
      source: url,
      type: contentType.split(';')[0],
      subtitles: [],
      headers: {}
    };
  }

  const html = await response.text();
  const dom = new JSDOM(html);

  const video = dom.window.document.querySelector('video');
  if (video) {
    const source = video.querySelector('source')?.getAttribute('src') || video.getAttribute('src');
    if (source) {
      return {
        source,
        type: source.includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4',
        subtitles: [],
        headers: {}
      };
    }
  }

  const scripts = dom.window.document.querySelectorAll('script');
  for (const script of scripts) {
    const content = script.textContent;
    const m3u8Match = content.match(/https?:\/\/[^\s"']+\.m3u8[^\s"']*/);
    if (m3u8Match) {
      return {
        source: m3u8Match[0],
        type: 'application/vnd.apple.mpegurl',
        subtitles: [],
        headers: {}
      };
    }
  }

  throw new Error('Could not extract video from URL');
}