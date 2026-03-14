import { isTV } from "../tmdb";

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
      // For TV, we might need to resolve the internal ID, 
      // but let's try the direct tmdb|series|<id> first as a fallback
      const rawId = base64Encode(`tmdb|series|${item.id}`);
      
      try {
        const titleRes = await fetch(`${MAIN_URL}/api/v1/titles/${rawId}?loader=titlePage`);
        const titleData = await titleRes.json();
        const mediaId = titleData?.title?.id || rawId;
        
        const epRes = await fetch(`${MAIN_URL}/api/v1/titles/${mediaId}/seasons/${season}/episodes/${episode}?loader=episodePage`);
        const epData = await epRes.json();
        
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
      const res = await fetch(`${MAIN_URL}/api/v1/titles/${pathId}?loader=titlePage`);
      const data = await res.json();
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
