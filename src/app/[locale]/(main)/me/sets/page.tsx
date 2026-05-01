import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Link } from '@/i18n/navigation';
import { ListMusic, Plus, Share2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSetlist, deleteSetlist } from './actions';

export const metadata = { title: 'My Sets — Stuti Geet' };

type SetlistRow = {
  id: string;
  slug: string;
  title: string;
  service_date: string | null;
  is_public: boolean;
  updated_at: string;
  item_count: number;
};

export default async function MySetsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login?next=/me/sets');

  const supabase = await createClient();
  const { data } = await supabase
    .from('setlists')
    .select('id, slug, title, service_date, is_public, updated_at')
    .eq('owner_id', profile.id)
    .order('updated_at', { ascending: false });

  const setlists = (data ?? []) as SetlistRow[];

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://stutigeet.com';

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <ListMusic className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-semibold">My Sets</h1>
      </div>

      {/* Create setlist form */}
      <div className="mb-8 rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-medium mb-3">New setlist</h2>
        <form action={createSetlist} className="flex items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="title" className="text-xs">Title</Label>
            <Input id="title" name="title" placeholder="Sunday worship" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="service_date" className="text-xs">Date (optional)</Label>
            <Input id="service_date" name="service_date" type="date" className="w-40" />
          </div>
          <Button type="submit" size="sm" className="gap-1.5 shrink-0">
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </form>
      </div>

      {setlists.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No sets yet. Create your first one above.</p>
      ) : (
        <div className="space-y-3">
          {setlists.map((set) => (
            <div
              key={set.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:bg-muted/30 transition-colors"
            >
              <Link href={`/me/sets/${set.id}`} className="flex-1 min-w-0">
                <p className="font-medium truncate">{set.title}</p>
                <p className="text-xs text-muted-foreground">
                  {set.service_date
                    ? new Date(set.service_date).toLocaleDateString()
                    : 'No date'}
                  {' · '}
                  {set.is_public ? (
                    <span className="text-green-600 dark:text-green-400">Public</span>
                  ) : (
                    'Private'
                  )}
                </p>
              </Link>

              {set.is_public && (
                <a
                  href={`${BASE_URL}/sets/${profile.id}/${set.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Share link"
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </a>
              )}

              <form
                action={async () => {
                  'use server';
                  await deleteSetlist(set.id);
                }}
              >
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
