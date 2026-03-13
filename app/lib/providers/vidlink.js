import { isTV } from "../tmdb";

export const vidLinkProvider = {
  id: "vidlink",
  name: "VidLink",
  getUrl: (item, season, episode) => {
    return isTV(item)
      ? `https://vidlink.pro/tv/${item.id}/${season}/${episode}`
      : `https://vidlink.pro/movie/${item.id}`;
  }
};
