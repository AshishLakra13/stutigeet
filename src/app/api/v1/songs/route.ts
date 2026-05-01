import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { applyRateLimit, apiResponse, getCorsHeaders } from '@/lib/api-helpers';

const PAGE_SIZE = 20;

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  });
}

export async function GET(request: NextRequest) {
  const limited = await applyRateLimit(request);
  if (limited) return limited;

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? String(PAGE_SIZE), 10)));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from('songs')
    .select('id, slug, title_hi, title_en, original_key, bpm, themes, language, copyright_status, artist_original, created_at', { count: 'exact' })
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('[api/v1/songs] DB error:', error.message);
    return NextResponse.json(
      { data: null, error: 'Internal server error', meta: null },
      { status: 500, headers: getCorsHeaders(request.headers.get('origin')) },
    );
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return apiResponse(
    data ?? [],
    { total, page, limit, totalPages, from: from + 1, to: Math.min(to + 1, total) },
    request.headers.get('origin'),
  );
}
