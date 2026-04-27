import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Song } from '@/types/song';

export const revalidate = 60; // re-fetch at most once per minute

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('songs')
    .select('id, slug, title_hi, title_en, original_key, bpm, themes, language, artist_original')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? [] as Partial<Song>[]);
}
