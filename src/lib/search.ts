import Fuse, { type IFuseOptions } from 'fuse.js';
import type { Song } from '@/types/song';

export type SongSearchRecord = Pick<
  Song,
  'id' | 'slug' | 'title_hi' | 'title_en' | 'original_key' | 'bpm' | 'themes' | 'artist_original'
>;

const FUSE_OPTIONS: IFuseOptions<SongSearchRecord> = {
  keys: [
    { name: 'title_hi', weight: 2 },
    { name: 'title_en', weight: 2 },
    { name: 'artist_original', weight: 1 },
    { name: 'themes', weight: 0.5 },
  ],
  threshold: 0.35,
  minMatchCharLength: 2,
  includeScore: true,
};

export function createFuseIndex(songs: SongSearchRecord[]) {
  return new Fuse(songs, FUSE_OPTIONS);
}

export function searchSongs(
  fuse: Fuse<SongSearchRecord>,
  query: string,
): SongSearchRecord[] {
  if (!query.trim()) return [];
  return fuse.search(query).map((r) => r.item);
}
