import { notFound, redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Link } from '@/i18n/navigation';
import { ChevronLeft, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SetlistEditor, type SetlistItem } from './SetlistEditor';
import { AddSongSearch } from './AddSongSearch';
import { updateSetlist } from '../actions';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function SetlistDetailPage({ params }: Props) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login?next=/me/sets');

  const supabase = await createClient();
  const { data: setlist } = await supabase
    .from('setlists')
    .select('id, slug, owner_id, title, service_date, is_public, notes')
    .eq('id', id)
    .eq('owner_id', profile.id)
    .single();

  if (!setlist) notFound();

  const { data: itemData } = await supabase
    .from('setlist_items')
    .select('id, position, key_override, capo_override, notes, songs(id, slug, title_hi, title_en, original_key)')
    .eq('setlist_id', id)
    .order('position', { ascending: true });

  const items: SetlistItem[] = ((itemData ?? []) as unknown as Array<{
    id: string;
    position: number;
    key_override: string | null;
    capo_override: number | null;
    notes: string | null;
    songs: { id: string; slug: string; title_hi: string | null; title_en: string | null; original_key: string | null };
  }>).map((row) => ({
    id: row.id,
    position: row.position,
    key_override: row.key_override,
    capo_override: row.capo_override,
    notes: row.notes,
    song: row.songs,
  }));

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://stutigeet.com';
  const publicUrl = `${BASE_URL}/sets/${profile.id}/${setlist.slug}`;

  const boundUpdate = updateSetlist.bind(null, id);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      {/* Back */}
      <Link href="/me/sets" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" />
        My Sets
      </Link>

      {/* Metadata form */}
      <form action={boundUpdate} className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h1 className="font-semibold text-lg">{setlist.title}</h1>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={setlist.title} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="service_date">Date</Label>
            <Input
              id="service_date"
              name="service_date"
              type="date"
              defaultValue={setlist.service_date ?? ''}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Input id="notes" name="notes" defaultValue={setlist.notes ?? ''} placeholder="Optional notes for the team" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="hidden"
              name="is_public"
              value={setlist.is_public ? 'true' : 'false'}
            />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                name="is_public"
                value="true"
                defaultChecked={setlist.is_public}
                onChange={(e) => {
                  const hidden = e.currentTarget.form?.querySelector('input[name="is_public"][type="hidden"]');
                  if (hidden) (hidden as HTMLInputElement).value = e.currentTarget.checked ? 'true' : 'false';
                }}
                className="rounded"
              />
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              Make public
            </label>
          </div>

          <Button type="submit" size="sm">Save</Button>
        </div>

        {setlist.is_public && (
          <p className="text-xs text-muted-foreground">
            Share link:{' '}
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="underline">
              {publicUrl}
            </a>
          </p>
        )}
      </form>

      {/* Song list with drag reorder */}
      <div>
        <h2 className="font-medium mb-3">Songs ({items.length})</h2>
        <SetlistEditor setlistId={id} initialItems={items} />
      </div>

      {/* Add songs */}
      <div>
        <h2 className="font-medium mb-3">Add songs</h2>
        <AddSongSearch setlistId={id} />
      </div>
    </main>
  );
}
