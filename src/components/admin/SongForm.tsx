'use client';

import { useState, useRef, useEffect, useActionState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChordSheet } from '@/components/ChordSheet';
import { parseChordPro, transposeToKey, songToHtml } from '@/lib/chordpro';
import { MAJOR_KEYS, MINOR_KEYS } from '@/lib/keys';
import { slugify } from '@/lib/slug';
import { createSong, updateSong, type ActionState } from '@/app/(admin)/admin/songs/actions';
import type { Song } from '@/types/song';
import { cn } from '@/lib/utils';

const ALL_KEYS = [...MAJOR_KEYS, ...MINOR_KEYS];
const COPYRIGHT_OPTIONS = [
  { value: 'public_domain', label: 'Public domain' },
  { value: 'original', label: 'Original' },
  { value: 'licensed', label: 'Licensed' },
  { value: 'permission_granted', label: 'Permission granted' },
  { value: 'placeholder', label: 'Placeholder' },
] as const;
const TEMPO_OPTIONS = [
  { value: 'slow', label: 'Slow' },
  { value: 'mid', label: 'Mid' },
  { value: 'fast', label: 'Fast' },
] as const;

type SongFormProps = {
  song?: Song;
};

const initialState: ActionState = {};

export function SongForm({ song }: SongFormProps) {
  const isEdit = !!song;
  const router = useRouter();

  // Bound action for edit vs create
  const action = isEdit
    ? updateSong.bind(null, song.slug)
    : createSong;

  const [state, formAction, isPending] = useActionState(action, initialState);

  // Controlled state for live preview
  const [chordpro, setChordpro] = useState(song?.lyrics_chordpro ?? '');
  const [previewKey, setPreviewKey] = useState(song?.original_key ?? '');

  const previewHtml = useMemo(() => {
    if (!chordpro.trim()) return '';
    try {
      const parsed = parseChordPro(chordpro);
      const transposed = previewKey ? transposeToKey(parsed, previewKey) : parsed;
      return songToHtml(transposed);
    } catch {
      const escaped = chordpro
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<pre class="text-sm text-muted-foreground whitespace-pre-wrap">${escaped}</pre>`;
    }
  }, [chordpro, previewKey]);

  // Slug auto-generation
  const [slug, setSlug] = useState(song?.slug ?? '');
  const slugTouched = useRef(isEdit); // don't override slug when editing
  const [titleEn, setTitleEn] = useState(song?.title_en ?? '');

  useEffect(() => {
    if (!slugTouched.current && titleEn) {
      setSlug(slugify(titleEn));
    }
  }, [titleEn]);

  function FieldError({ field }: { field: string }) {
    const msg = state.errors?.[field];
    if (!msg) return null;
    return <p className="text-xs text-destructive mt-1">{msg}</p>;
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* ── Left: Form ──────────────────────────────────────── */}
      <form action={formAction} className="space-y-5">
        {/* Global error */}
        {state.errors?.form && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {state.errors.form}
          </div>
        )}

        {/* Titles */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="title_hi">Title (Hindi)</Label>
            <Input
              id="title_hi"
              name="title_hi"
              lang="hi"
              className="font-[family-name:var(--font-devanagari)]"
              placeholder="यीशु प्यारा"
              defaultValue={song?.title_hi ?? ''}
            />
            <FieldError field="title_hi" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title_en">Title (English)</Label>
            <Input
              id="title_en"
              name="title_en"
              placeholder="Yeshu Pyaara"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
            />
            <FieldError field="title_en" />
          </div>
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <Label htmlFor="slug">
            Slug
            <span className="ml-2 text-xs text-muted-foreground font-normal">
              (auto-generated from English title)
            </span>
          </Label>
          <Input
            id="slug"
            name="slug"
            placeholder="yeshu-pyaara"
            value={slug}
            onChange={(e) => {
              slugTouched.current = true;
              setSlug(e.target.value);
            }}
            className={cn(state.errors?.slug && 'border-destructive')}
          />
          <FieldError field="slug" />
        </div>

        {/* Key + BPM + Tempo */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="original_key">Key</Label>
            <Select
              name="original_key"
              defaultValue={song?.original_key ?? ''}
              onValueChange={(v) => setPreviewKey(v ?? '')}
            >
              <SelectTrigger id="original_key">
                <SelectValue placeholder="Pick key" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">— none —</SelectItem>
                {ALL_KEYS.map((k) => (
                  <SelectItem key={k} value={k} className="font-mono text-sm">
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError field="original_key" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bpm">BPM</Label>
            <Input
              id="bpm"
              name="bpm"
              type="number"
              min={20}
              max={300}
              placeholder="72"
              defaultValue={song?.bpm ?? ''}
            />
            <FieldError field="bpm" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tempo">Tempo</Label>
            <Select name="tempo" defaultValue={song?.tempo ?? ''}>
              <SelectTrigger id="tempo">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">— none —</SelectItem>
                {TEMPO_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ChordPro lyrics */}
        <div className="space-y-1.5">
          <Label htmlFor="lyrics_chordpro">
            ChordPro lyrics
            <span className="ml-2 text-xs text-muted-foreground font-normal">
              (preview updates live →)
            </span>
          </Label>
          <textarea
            id="lyrics_chordpro"
            name="lyrics_chordpro"
            value={chordpro}
            onChange={(e) => setChordpro(e.target.value)}
            placeholder={`{title: Song Title}\n{key: G}\n\n{verse}\n[G]Yeshu [C]naam hai [G]adbhut`}
            className={cn(
              'w-full rounded-xl border border-border bg-background',
              'px-3 py-2.5 text-sm font-mono leading-relaxed',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
              'resize-none h-72 lg:h-[55vh]',
              'transition-colors',
              state.errors?.lyrics_chordpro && 'border-destructive',
            )}
            spellCheck={false}
            autoComplete="off"
          />
          <FieldError field="lyrics_chordpro" />
        </div>

        {/* Artist + YouTube */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="artist_original">Artist / Original</Label>
            <Input
              id="artist_original"
              name="artist_original"
              placeholder="Traditional"
              defaultValue={song?.artist_original ?? ''}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="youtube_url">YouTube URL</Label>
            <Input
              id="youtube_url"
              name="youtube_url"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              defaultValue={song?.youtube_url ?? ''}
            />
            <FieldError field="youtube_url" />
          </div>
        </div>

        {/* Themes + Language */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="themes">
              Themes
              <span className="ml-1 text-xs text-muted-foreground font-normal">(comma-separated)</span>
            </Label>
            <Input
              id="themes"
              name="themes"
              placeholder="praise, christmas, communion"
              defaultValue={song?.themes?.join(', ') ?? ''}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="language">
              Language
              <span className="ml-1 text-xs text-muted-foreground font-normal">(comma-separated)</span>
            </Label>
            <Input
              id="language"
              name="language"
              placeholder="hi, en"
              defaultValue={song?.language?.join(', ') ?? 'hi'}
            />
          </div>
        </div>

        {/* Copyright */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="copyright_status">Copyright status</Label>
            <Select name="copyright_status" defaultValue={song?.copyright_status ?? ''}>
              <SelectTrigger id="copyright_status">
                <SelectValue placeholder="— select —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">— none —</SelectItem>
                {COPYRIGHT_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="copyright_notes">Copyright notes</Label>
            <Input
              id="copyright_notes"
              name="copyright_notes"
              placeholder="e.g. CCLI #12345"
              defaultValue={song?.copyright_notes ?? ''}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={isPending} className="gap-2">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Save changes' : 'Add song'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/admin/songs')}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </form>

      {/* ── Right: Live preview ──────────────────────────────── */}
      <div className="lg:sticky lg:top-20 lg:self-start space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Live preview
          </p>
          {previewKey && (
            <span className="text-xs font-mono text-muted-foreground">
              Key: {previewKey}
            </span>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card min-h-48 p-4 overflow-auto max-h-[80vh]">
          {previewHtml ? (
            <ChordSheet html={previewHtml} />
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Start typing ChordPro lyrics to see the preview…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
