'use client';

import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { approveRevision, rejectRevision, type ReviewActionState } from '../actions';

type RevisionCardProps = {
  revision: {
    id: string;
    notes: string | null;
    created_at: string;
    payload: Record<string, unknown>;
    author: { display_name: string | null; email: string } | null;
    song: {
      id: string;
      slug: string;
      title_hi: string | null;
      title_en: string | null;
      is_published: boolean;
      lyrics_chordpro: string;
      original_key: string | null;
      artist_original: string | null;
      themes: string[] | null;
      language: string[] | null;
      youtube_url: string | null;
      bpm: number | null;
      tempo: string | null;
      source_url: string | null;
      source_name: string | null;
    };
  };
};

const DIFF_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'title_hi', label: 'Title (Hindi)' },
  { key: 'title_en', label: 'Title (English)' },
  { key: 'artist_original', label: 'Artist' },
  { key: 'original_key', label: 'Key' },
  { key: 'bpm', label: 'BPM' },
  { key: 'tempo', label: 'Tempo' },
  { key: 'youtube_url', label: 'YouTube URL' },
  { key: 'source_url', label: 'Source URL' },
  { key: 'source_name', label: 'Source name' },
];

function normalise(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  if (Array.isArray(v)) return v.join(', ') || '—';
  return String(v);
}

const initialState: ReviewActionState = {};

export function RevisionCard({ revision }: RevisionCardProps) {
  const { id, song, author, notes, created_at, payload } = revision;

  const boundApprove = approveRevision.bind(null, id, song.id);
  const boundReject = rejectRevision.bind(null, id);

  const [approveState, approveAction, approvePending] = useActionState(boundApprove, initialState);
  const [rejectState, rejectAction, rejectPending] = useActionState(boundReject, initialState);

  const isNew = !song.is_published;
  const authorLabel = author?.display_name ?? author?.email ?? 'Unknown';
  const date = new Date(created_at).toLocaleDateString();

  // Compute changed fields (skip lyrics — shown separately)
  const changedFields = DIFF_FIELDS.filter(({ key }) => {
    const current = normalise((song as Record<string, unknown>)[key]);
    const proposed = normalise(payload[key]);
    return current !== proposed;
  });

  const lyricsChanged = payload.lyrics_chordpro !== song.lyrics_chordpro;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-border bg-muted/30">
        <div>
          <div className="flex items-center gap-2">
            {isNew && (
              <span className="text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded-full">
                New song
              </span>
            )}
            <span className="font-semibold">
              {song.title_en ?? song.title_hi ?? song.slug}
            </span>
            {song.title_hi && song.title_en && (
              <span className="text-sm text-muted-foreground font-[family-name:var(--font-devanagari)]">
                {song.title_hi}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            by {authorLabel} · {date} ·{' '}
            <a
              href={`/songs/${song.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              view song ↗
            </a>
          </p>
        </div>
      </div>

      {/* Diff */}
      <div className="px-5 py-4 space-y-4">
        {notes && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-0.5">
              Contributor notes
            </p>
            <p className="text-sm text-amber-900 dark:text-amber-200">{notes}</p>
          </div>
        )}

        {changedFields.length === 0 && !lyricsChanged ? (
          <p className="text-sm text-muted-foreground italic">No field changes detected.</p>
        ) : (
          <>
            {changedFields.length > 0 && (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="pb-1 pr-4 font-medium w-32">Field</th>
                    <th className="pb-1 pr-4 font-medium">Current</th>
                    <th className="pb-1 font-medium">Proposed</th>
                  </tr>
                </thead>
                <tbody>
                  {changedFields.map(({ key, label }) => (
                    <tr key={key} className="border-t border-border/50">
                      <td className="py-1.5 pr-4 text-muted-foreground text-xs">{label}</td>
                      <td className="py-1.5 pr-4 line-through text-muted-foreground">
                        {normalise((song as Record<string, unknown>)[key])}
                      </td>
                      <td className="py-1.5 text-green-700 dark:text-green-400 font-medium">
                        {normalise(payload[key])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {lyricsChanged && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Lyrics changed
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Current</p>
                    <pre className="text-xs font-mono bg-muted rounded-lg p-3 overflow-auto max-h-40 whitespace-pre-wrap text-muted-foreground line-through">
                      {song.lyrics_chordpro}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Proposed</p>
                    <pre className="text-xs font-mono bg-green-50 dark:bg-green-900/20 rounded-lg p-3 overflow-auto max-h-40 whitespace-pre-wrap text-green-800 dark:text-green-300">
                      {String(payload.lyrics_chordpro ?? '')}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 px-5 py-4 border-t border-border bg-muted/20">
        {/* Approve */}
        <form action={approveAction} className="contents">
          <Button
            type="submit"
            size="sm"
            disabled={approvePending || rejectPending}
            className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
          >
            {approvePending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Approve
          </Button>
          {approveState.error && (
            <p className="text-xs text-destructive self-center">{approveState.error}</p>
          )}
        </form>

        {/* Reject */}
        <form action={rejectAction} className="flex items-center gap-2 flex-1">
          <Label htmlFor={`reason-${id}`} className="sr-only">
            Rejection reason
          </Label>
          <Input
            id={`reason-${id}`}
            name="reason"
            placeholder="Reason (optional)"
            className="h-8 text-sm flex-1"
            disabled={approvePending || rejectPending}
          />
          <Button
            type="submit"
            size="sm"
            variant="outline"
            disabled={approvePending || rejectPending}
            className="gap-1.5 shrink-0"
          >
            {rejectPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Reject
          </Button>
          {rejectState.error && (
            <p className="text-xs text-destructive">{rejectState.error}</p>
          )}
        </form>
      </div>
    </div>
  );
}
