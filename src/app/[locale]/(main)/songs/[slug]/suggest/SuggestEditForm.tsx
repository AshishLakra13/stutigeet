'use client';

import { useActionState, useMemo, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
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
import { Link } from '@/i18n/navigation';
import { submitRevision, type RevisionActionState } from './actions';
import type { Song } from '@/types/song';
import { cn } from '@/lib/utils';

const ALL_KEYS = [...MAJOR_KEYS, ...MINOR_KEYS];
const TEMPO_OPTIONS = [
  { value: 'slow', label: 'Slow' },
  { value: 'mid', label: 'Mid' },
  { value: 'fast', label: 'Fast' },
] as const;

type SuggestEditFormProps = {
  song: Song;
};

const initialState: RevisionActionState = {};

export function SuggestEditForm({ song }: SuggestEditFormProps) {
  const boundAction = submitRevision.bind(null, song.id, song.slug);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  const [chordpro, setChordpro] = useState(song.lyrics_chordpro ?? '');
  const [previewKey, setPreviewKey] = useState(song.original_key ?? '');

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

  if (state.ok) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <h2 className="text-xl font-semibold">Edit submitted!</h2>
        <p className="text-muted-foreground max-w-sm">
          Your suggestion has been sent for review. An editor will approve or reject it shortly.
        </p>
        <Link href={`/songs/${song.slug}`}>
          <Button variant="outline">← Back to song</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left: Form */}
      <form action={formAction} className="space-y-5">
        {state.errors?.form && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {state.errors.form}
          </div>
        )}

        {/* Hidden slug (required by parseSongFormData) */}
        <input type="hidden" name="slug" value={song.slug} />

        {/* Slug display (read-only) */}
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">Slug (not editable)</Label>
          <p className="font-mono text-sm px-3 py-2 rounded-lg bg-muted text-muted-foreground">
            {song.slug}
          </p>
        </div>

        {/* Titles */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="title_hi">Title (Hindi)</Label>
            <Input
              id="title_hi"
              name="title_hi"
              lang="hi"
              className="font-[family-name:var(--font-devanagari)]"
              defaultValue={song.title_hi ?? ''}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title_en">Title (English)</Label>
            <Input
              id="title_en"
              name="title_en"
              defaultValue={song.title_en ?? ''}
            />
          </div>
        </div>

        {/* Key + BPM + Tempo */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="original_key">Key</Label>
            <Select
              name="original_key"
              defaultValue={song.original_key ?? ''}
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
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bpm">BPM</Label>
            <Input
              id="bpm"
              name="bpm"
              type="number"
              min={20}
              max={300}
              defaultValue={song.bpm ?? ''}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tempo">Tempo</Label>
            <Select name="tempo" defaultValue={song.tempo ?? ''}>
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
            className={cn(
              'w-full rounded-xl border border-border bg-background',
              'px-3 py-2.5 text-sm font-mono leading-relaxed',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
              'resize-none h-64 lg:h-[45vh]',
              state.errors?.lyrics_chordpro && 'border-destructive',
            )}
            spellCheck={false}
            autoComplete="off"
          />
          {state.errors?.lyrics_chordpro && (
            <p className="text-xs text-destructive">{state.errors.lyrics_chordpro}</p>
          )}
        </div>

        {/* Artist + YouTube */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="artist_original">Artist / Original</Label>
            <Input
              id="artist_original"
              name="artist_original"
              defaultValue={song.artist_original ?? ''}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="youtube_url">YouTube URL</Label>
            <Input
              id="youtube_url"
              name="youtube_url"
              type="url"
              defaultValue={song.youtube_url ?? ''}
            />
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
              defaultValue={song.themes?.join(', ') ?? ''}
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
              defaultValue={song.language?.join(', ') ?? 'hi'}
            />
          </div>
        </div>

        {/* Source info */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="source_url">Source URL</Label>
            <Input
              id="source_url"
              name="source_url"
              type="url"
              placeholder="https://..."
              defaultValue={song.source_url ?? ''}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="source_name">Source name</Label>
            <Input
              id="source_name"
              name="source_name"
              placeholder="e.g. Masihi Geet Mala"
              defaultValue={song.source_name ?? ''}
            />
          </div>
        </div>

        {/* Contributor notes */}
        <div className="space-y-1.5">
          <Label htmlFor="notes">
            Notes for reviewer
            <span className="ml-1 text-xs text-muted-foreground font-normal">(optional)</span>
          </Label>
          <textarea
            id="notes"
            name="notes"
            placeholder="Describe what you changed and why…"
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring resize-none h-20"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={isPending} className="gap-2">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit edit suggestion
          </Button>
          <Link href={`/songs/${song.slug}`}>
            <Button type="button" variant="ghost" disabled={isPending}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>

      {/* Right: Live preview */}
      <div className="lg:sticky lg:top-20 lg:self-start space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Live preview
        </p>
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
