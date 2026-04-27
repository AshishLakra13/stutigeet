export type CopyrightStatus =
  | 'public_domain'
  | 'original'
  | 'licensed'
  | 'permission_granted'
  | 'placeholder'
  | 'unverified';

export interface Song {
  id: string;
  slug: string;
  title_hi: string | null;
  title_en: string | null;
  lyrics_chordpro: string;
  lyrics_chordpro_en: string | null;
  original_key: string | null;
  bpm: number | null;
  tempo: string | null;
  themes: string[] | null;
  language: string[] | null;
  artist_original: string | null;
  youtube_url: string | null;
  copyright_status: CopyrightStatus | null;
  copyright_notes: string | null;
  created_at: string;
  updated_at: string;
  last_sung_at: string | null;
}
