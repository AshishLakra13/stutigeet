export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { BandPdf, CongregationPdf } from '@/lib/pdf-renderer';
import { applyRateLimit } from '@/lib/api-helpers';
import React, { type ReactElement } from 'react';

const VALID_LAYOUTS = ['band', 'congregation'] as const;
type Layout = typeof VALID_LAYOUTS[number];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ user: string; slug: string }> },
) {
  const limited = await applyRateLimit(request);
  if (limited) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const { user, slug } = await params;
  const rawLayout = request.nextUrl.searchParams.get('layout');
  const layout: Layout = VALID_LAYOUTS.includes(rawLayout as Layout)
    ? (rawLayout as Layout)
    : 'band';

  const supabase = await createClient();

  const { data: setlist } = await supabase
    .from('setlists')
    .select('id, title, is_public')
    .eq('owner_id', user)
    .eq('slug', slug)
    .single();

  if (!setlist || !setlist.is_public) {
    return NextResponse.json({ error: 'Not found or not public' }, { status: 404 });
  }

  const { data: itemData } = await supabase
    .from('setlist_items')
    .select('position, songs(title_hi, title_en, lyrics_chordpro, copyright_notes, source_name)')
    .eq('setlist_id', setlist.id)
    .order('position', { ascending: true });

  type ItemRow = {
    songs: { title_hi: string | null; title_en: string | null; lyrics_chordpro: string; copyright_notes: string | null; source_name: string | null };
  };
  const items = (itemData ?? []) as unknown as ItemRow[];

  const combinedLyrics = items
    .map((item, i) => {
      const title = item.songs.title_hi ?? item.songs.title_en ?? '';
      return `{title: ${i + 1}. ${title}}\n\n${item.songs.lyrics_chordpro}`;
    })
    .join('\n\n');

  const props = {
    titleHi: setlist.title,
    titleEn: null,
    lyricsChordpro: combinedLyrics,
    copyrightNote: 'Stuti Geet — stutigeet.com',
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
      },
    });
  } catch (err) {
    console.error('Setlist PDF error:', err);
    return NextResponse.json({ error: 'Failed to render PDF' }, { status: 500 });
  }
}
