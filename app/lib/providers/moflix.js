import { isTV } from "../tmdb";
import { fetchData } from "../fetchData";

const MAIN_URL = "https://moflix-stream.xyz";

const base64Encode = (str) => {
  return btoa(str).replace(/=+$/, ""); // Moflix often likes no-padding base64
};

export const moflixProvider = {
  id: "moflix",
  name: "Moflix (Multi-Server)",
  isAsync: true,
  getUrl: async (item, season = 1, episode = 1) => {
    const tv = isTV(item);
    let pathId;

    if (!tv) {
      pathId = base64Encode(`tmdb|movie|${item.id}`);
    } else {
      const rawId = base64Encode(`tmdb|series|${item.id}`);
      
      try {
        const titleData = await fetchData(`${MAIN_URL}/api/v1/titles/${rawId}?loader=titlePage`);
        const mediaId = titleData?.title?.id || rawId;
        
        const epData = await fetchData(`${MAIN_URL}/api/v1/titles/${mediaId}/seasons/${season}/episodes/${episode}?loader=episodePage`);
        
        const videos = epData.videos || epData.episode?.videos || [];
        return videos.map(v => ({
          name: v.name || "Mirror",
          url: v.src,
          id: v.id
        }));
      } catch (e) {
        console.error("Moflix TV fetch error", e);
        return [];
      }
    }

    try {
      const data = await fetchData(`${MAIN_URL}/api/v1/titles/${pathId}?loader=titlePage`);
      const videos = data.videos || data.title?.videos || [];
      return videos.map(v => ({
        name: v.name || "Mirror",
        url: v.src,
        id: v.id
      }));
    } catch (e) {
      console.error("Moflix fetch error", e);
      return [];
    }
  }
};
