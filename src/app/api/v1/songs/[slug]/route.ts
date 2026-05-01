import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { applyRateLimit, apiResponse, getCorsHeaders } from '@/lib/api-helpers';
import { isLyricRenderingAllowed } from '@/lib/verification-gate';
import type { Song } from '@/types/song';

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const limited = await applyRateLimit(request);
  if (limited) return limited;

  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    console.error('[api/v1/songs/slug] DB error:', error.message);
    return NextResponse.json(
      { data: null, error: 'Internal server error', meta: null },
      { status: 500, headers: getCorsHeaders(request.headers.get('origin')) },
    );
  }

  if (!data) {
    return NextResponse.json(
      { data: null, error: 'Not found', meta: null },
      { status: 404, headers: getCorsHeaders(request.headers.get('origin')) },
    );
  }

  const song = data as Song;
  const allowed = await isLyricRenderingAllowed(song);

  const payload = {
    id: song.id,
    slug: song.slug,
    title_hi: song.title_hi,
    title_en: song.title_en,
    original_key: song.original_key,
    bpm: song.bpm,
    themes: song.themes,
    language: song.language,
    copyright_status: song.copyright_status,
    artist_original: song.artist_original,
    source_name: song.source_name,
    verified_at: song.verified_at,
    created_at: song.created_at,
    updated_at: song.updated_at,
    lyrics_chordpro: allowed ? song.lyrics_chordpro : null,
    lyrics_available: allowed,
  };

  return apiResponse(payload, null, request.headers.get('origin'));
}
