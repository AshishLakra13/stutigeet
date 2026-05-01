export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';
import { getSongBySlug } from '@/lib/songs';
import { isLyricRenderingAllowed } from '@/lib/verification-gate';
import { BandPdf, CongregationPdf } from '@/lib/pdf-renderer';
import { applyRateLimit } from '@/lib/api-helpers';
import React, { type ReactElement } from 'react';

const VALID_LAYOUTS = ['band', 'congregation'] as const;
type Layout = typeof VALID_LAYOUTS[number];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const limited = await applyRateLimit(request);
  if (limited) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const { slug } = await params;
  const rawLayout = request.nextUrl.searchParams.get('layout');
  const layout: Layout = VALID_LAYOUTS.includes(rawLayout as Layout)
    ? (rawLayout as Layout)
    : 'band';

  const song = await getSongBySlug(slug);
  if (!song) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const allowed = await isLyricRenderingAllowed(song);
  if (!allowed) return NextResponse.json({ error: 'Lyrics not available' }, { status: 403 });

  const props = {
    titleHi: song.title_hi,
    titleEn: song.title_en,
    lyricsChordpro: song.lyrics_chordpro,
    copyrightNote: song.copyright_notes ?? song.source_name ?? null,
  };

  const element =
    layout === 'congregation'
      ? React.createElement(CongregationPdf, props)
      : React.createElement(BandPdf, props);

  try {
    const buffer = await renderToBuffer(element as ReactElement<DocumentProps>);
    // Sanitize slug: only allow alphanumeric and hyphens in filename
    const safeSlug = slug.replace(/[^a-z0-9-]/gi, '');
    const filename = `${safeSlug}-${layout}.pdf`;
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.error('PDF render error:', err);
    return NextResponse.json({ error: 'Failed to render PDF' }, { status: 500 });
  }
}
