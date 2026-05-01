import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { SearchButton } from '@/components/SearchButton';
import { getCurrentProfile } from '@/lib/auth';
import { BrandMark } from '@/components/BrandMark';
import { AvatarMenu } from '@/components/AvatarMenu';
import { signOut } from '@/app/[locale]/(main)/account/actions';

export async function TopHeader() {
  const [profile, t] = await Promise.all([getCurrentProfile(), getTranslations('Nav')]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <BrandMark size={24} className="shrink-0" />
          <span className="font-[family-name:var(--font-crimson)] text-xl font-semibold tracking-tight">
            Stuti Geet
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/songs" className="hover:text-foreground transition-colors">
            {t('songs')}
          </Link>
          {profile && profile.role !== 'viewer' && (
            <Link href="/contribute" className="hover:text-foreground transition-colors">
              {t('contribute')}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-1">
          <SearchButton />
          <ThemeToggle />
          {profile && (
            <AvatarMenu
              displayName={profile.display_name}
              avatarUrl={profile.avatar_url}
              role={profile.role}
              signOutAction={signOut}
            />
          )}
        </div>
      </div>
    </header>
  );
}
