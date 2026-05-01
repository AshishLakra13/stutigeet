import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/api-helpers';

export const runtime = 'nodejs';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  // Rate limit: 30 view events per minute per IP to resist inflation
  const ip = getClientIp(request);
  const { allowed } = await checkRateLimit(`view:${ip}`);
  if (!allowed) {
    return NextResponse.json({ ok: true, skipped: true }, { status: 429 });
  }

  let songId: string | undefined;
  try {
    const body = await request.json();
    songId = typeof body?.songId === 'string' ? body.songId : undefined;
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  if (!songId || !UUID_RE.test(songId)) {
    return NextResponse.json({ error: 'songId must be a valid UUID' }, { status: 400 });
  }

  // Cookie-based deduplication: one count per song per day per browser
  const cookieKey = `sv_${songId}`;
  const today = new Date().toISOString().slice(0, 10);
  const existing = request.cookies.get(cookieKey)?.value;
  if (existing === today) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc('increment_song_view', { p_song_id: songId });

  if (error) {
    console.error('track view error:', error.message);
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookieKey, today, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
  return response;
}
