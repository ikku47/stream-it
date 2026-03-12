declare global {
  interface MediaItem {
    id: number | string;
    media_type?: string;
    title?: string;
    name?: string;
    poster_path?: string;
    backdrop_path?: string;
    overview?: string;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
    genre_ids?: number[];
    [key: string]: any;
  }

  interface MediaRowType {
    title: string;
    emoji?: string;
    items: MediaItem[];
    loading?: boolean;
  }
}

export {};
