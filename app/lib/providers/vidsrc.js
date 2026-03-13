import { isTV } from "../tmdb";

export const vidSrcProvider = {
  id: "vidsrc",
  name: "VidSrc",
  getUrl: (item, season, episode) => {
    return isTV(item)
      ? `https://vidsrc.me/embed/tv?tmdb=${item.id}&season=${season}&ep=${episode}`
      : `https://vidsrc.me/embed/movie?tmdb=${item.id}`;
  }
};
