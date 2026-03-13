import { isTV } from "../tmdb";

export const nunesProvider = {
  id: "tmdbplayer",
  name: "Nunes Network",
  getUrl: (item, season, episode) => {
    const tv = isTV(item);
    const params = new URLSearchParams({ type: tv ? "tv" : "movie", id: item.id, server: 1 });
    if (tv) { params.set("s", season); params.set("e", episode); }
    return `https://tmdbplayer.nunesnetwork.com/?${params}`;
  }
};
