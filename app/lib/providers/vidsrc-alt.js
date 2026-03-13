import { isTV } from "../tmdb";

const createVidsrcAltProvider = (id, name, domain) => ({
  id,
  name,
  getUrl: (item, season, episode) => {
    return isTV(item)
      ? `https://${domain}/embed/tv?tmdb=${item.id}&season=${season}&ep=${episode}`
      : `https://${domain}/embed/movie?tmdb=${item.id}`;
  }
});

export const vidsrcAltProviders = [
  createVidsrcAltProvider("vidsrcme-ru", "VidSrcMe RU", "vidsrcme.ru"),
  createVidsrcAltProvider("vidsrc-me-ru", "VidSrc-Me RU", "vidsrc-me.ru"),
  createVidsrcAltProvider("vidsrc-me-su", "VidSrc-Me SU", "vidsrc-me.su"),
  createVidsrcAltProvider("vsembed-ru", "VSEmbed RU", "vsembed.ru"),
  createVidsrcAltProvider("vidsrc-embed-su", "VSEmbed SU", "vidsrc-embed.su"),
  createVidsrcAltProvider("vsrc-su", "VSRc SU", "vsrc.su")
];
