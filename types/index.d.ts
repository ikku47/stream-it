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
    icon?: string;
    items: MediaItem[];
    loading?: boolean;
  }

  interface RadioStation {
    id: string;
    name: string;
    url: string;
    homepage?: string;
    favicon?: string;
    tags?: string;
    country?: string;
    countryCode?: string;
    language?: string;
    codec?: string;
    bitrate?: number;
    votes?: number;
    clicks?: number;
    lastCheckOk?: number;
    type: 'radio';
  }
}

export {};
