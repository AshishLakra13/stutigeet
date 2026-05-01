import { Link } from '@/i18n/navigation';
import { PlusCircle, Music, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAllSongs, getSongCount, getRecentSongs } from '@/lib/songs';

export const metadata = {
  title: 'Admin — Stuti Geet',
};

export default async function AdminDashboardPage() {
  const [count, recent] = await Promise.all([
    getSongCount(),
    getRecentSongs(5),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-crimson)] text-3xl font-semibold">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your worship song library
          </p>
        </div>
        <Link
          href="/admin/songs/new"
          className={cn(buttonVariants({ variant: 'default' }), 'gap-2')}
        >
          <PlusCircle className="h-4 w-4" />
          Add song
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Music className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">{count}</p>
              <p className="text-xs text-muted-foreground">Total songs</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">
                {recent[0]
                  ? new Date(recent[0].created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })
                  : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Last added</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent songs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Recently added</h2>
          <Link
            href="/admin/songs"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No songs yet.</p>
            <Link
              href="/admin/songs/new"
              className={cn(buttonVariants({ variant: 'outline' }), 'mt-4 gap-2')}
            >
              <PlusCircle className="h-4 w-4" />
              Add your first song
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((song) => (
              <Link
                key={song.id}
                href={`/admin/songs/${song.slug}/edit`}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 hover:bg-accent/50 transition-colors group"
              >
                <div className="min-w-0">
                  {song.title_hi && (
                    <p lang="hi" className="font-[family-name:var(--font-devanagari)] text-sm font-medium truncate">
                      {song.title_hi}
                    </p>
                  )}
                  {song.title_en && (
                    <p className="text-xs text-muted-foreground truncate">{song.title_en}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {song.original_key && (
                    <Badge variant="secondary" className="text-xs font-mono">
                      {song.original_key}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Edit →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
