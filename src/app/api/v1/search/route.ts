import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, apiResponse, getCorsHeaders } from '@/lib/api-helpers';
import { getPaginatedSongs } from '@/lib/songs-query';

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
  const q = searchParams.get('q') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));

  if (!q.trim()) {
    return NextResponse.json(
      { data: null, error: 'Missing query parameter: q', meta: null },
      { status: 400, headers: getCorsHeaders(request.headers.get('origin')) },
    );
  }

  const result = await getPaginatedSongs({ q, page });

  return apiResponse(
    result.rows,
    { total: result.total, page: result.page, limit: result.pageSize, totalPages: result.totalPages },
    request.headers.get('origin'),
  );
}
