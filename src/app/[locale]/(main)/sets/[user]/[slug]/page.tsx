import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Link } from '@/i18n/navigation';
import { ListMusic, Music } from 'lucide-react';

type Props = {
  params: Promise<{ locale: string; user: string; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { user, slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('setlists')
    .select('title, owner:profiles!owner_id(display_name)')
    .eq('owner_id', user)
    .eq('slug', slug)
    .eq('is_public', true)
    .single();
  if (!data) return {};
  const owner = (data.owner as unknown as { display_name: string | null })?.display_name ?? 'Someone';
  return { title: `${data.title} by ${owner} — Stuti Geet` };
}

export default async function PublicSetlistPage({ params }: Props) {
  const { user, slug } = await params;
  const supabase = await createClient();

  const { data: setlist } = await supabase
    .from('setlists')
    .select(
      'id, title, service_date, notes, owner:profiles!owner_id(display_name)',
    )
    .eq('owner_id', user)
    .eq('slug', slug)
    .eq('is_public', true)
    .single();

  if (!setlist) notFound();

  const { data: itemData } = await supabase
    .from('setlist_items')
    .select(
      'id, position, key_override, capo_override, notes, songs(id, slug, title_hi, title_en, original_key)',
    )
    .eq('setlist_id', setlist.id)
    .order('position', { ascending: true });

  type ItemRow = {
    id: string;
    position: number;
    key_override: string | null;
    capo_override: number | null;
    notes: string | null;
    songs: { id: string; slug: string; title_hi: string | null; title_en: string | null; original_key: string | null };
  };
  const items = (itemData ?? []) as unknown as ItemRow[];
  const owner = (setlist.owner as unknown as { display_name: string | null })?.display_name ?? '';

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{setlist.title}</h1>
          {owner && (
            <p className="text-sm text-muted-foreground mt-0.5">by {owner}</p>
          )}
          {setlist.service_date && (
            <p className="text-sm text-muted-foreground">
              {new Date(setlist.service_date).toLocaleDateString()}
            </p>
          )}
          {setlist.notes && (
            <p className="text-sm text-muted-foreground mt-1">{setlist.notes}</p>
          )}
        </div>
        <ListMusic className="h-8 w-8 text-muted-foreground shrink-0" />
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground">This setlist is empty.</p>
      ) : (
        <ol className="space-y-2">
          {items.map((item, idx) => (
            <li key={item.id}>
              <Link
                href={`/songs/${item.songs.slug}${item.key_override ? `?key=${item.key_override}` : ''}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <span className="text-muted-foreground text-sm font-mono w-5 shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  {item.songs.title_hi && (
                    <p className="font-[family-name:var(--font-devanagari)] text-base font-medium truncate">
                      {item.songs.title_hi}
                    </p>
                  )}
                  {item.songs.title_en && (
                    <p className="text-sm text-muted-foreground italic truncate">
                      {item.songs.title_en}
                    </p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground font-mono shrink-0 text-right">
                  {item.key_override ?? item.songs.original_key ?? ''}
                  {item.capo_override ? ` (capo ${item.capo_override})` : ''}
                </div>
                <Music className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
              {item.notes && (
                <p className="text-xs text-muted-foreground mt-1 pl-9">{item.notes}</p>
              )}
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
