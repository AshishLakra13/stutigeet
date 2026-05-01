export type CopyrightStatus =
  | 'public_domain'
  | 'original'
  | 'licensed'
  | 'permission_granted'
  | 'cc_by'
  | 'cc_by_sa'
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
  source_url: string | null;
  source_name: string | null;
  contributor_id: string | null;
  verified_at: string | null;
  verified_by: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  last_sung_at: string | null;
}
