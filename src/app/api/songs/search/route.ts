import { NextRequest, NextResponse } from 'next/server';
import { getPaginatedSongs } from '@/lib/songs-query';
import { applyRateLimit } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  const limited = await applyRateLimit(request);
  if (limited) return NextResponse.json([], { status: 429 });
  const { searchParams } = request.nextUrl;
  const q = searchParams.get('q') ?? '';
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '8', 10), 20);

  if (q.trim().length < 2) {
    return NextResponse.json([]);
  }

  try {
    const result = await getPaginatedSongs({ page: 1, q });
    const rows = result.rows.slice(0, limit).map((song) => ({
      id: song.id,
      slug: song.slug,
      title_hi: song.title_hi,
      title_en: song.title_en,
      original_key: song.original_key,
    }));
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
