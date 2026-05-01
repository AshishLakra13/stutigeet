'use client';

import { Menu } from '@base-ui/react/menu';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import type { Role } from '@/lib/auth';

type AvatarMenuProps = {
  displayName: string | null;
  avatarUrl: string | null;
  role: Role;
  signOutAction: () => Promise<void>;
};

function getInitials(name: string | null, email?: string): string {
  const source = name ?? email ?? '?';
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function AvatarMenu({ displayName, avatarUrl, role, signOutAction }: AvatarMenuProps) {
  const t = useTranslations('AvatarMenu');
  const initials = getInitials(displayName);

  return (
    <Menu.Root>
      <Menu.Trigger
        className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden ring-2 ring-transparent hover:ring-border focus-visible:ring-ring transition-all outline-none"
        aria-label={t('label')}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName ?? 'User avatar'}
            width={32}
            height={32}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-xs font-medium"
            aria-hidden="true"
          >
            {initials}
          </span>
        )}
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={8}>
          <Menu.Popup className="z-50 min-w-[160px] rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md origin-(--transform-origin) data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2">
            {displayName && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground truncate max-w-[180px]">
                  {displayName}
                </div>
                <Menu.Separator className="my-1 h-px bg-border" />
              </>
            )}

            <Menu.Item
              render={<Link href="/account" />}
              className="flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
            >
              {t('yourAccount')}
            </Menu.Item>

            <Menu.Item
              render={<Link href="/me/favorites" />}
              className="flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
            >
              {t('favorites')}
            </Menu.Item>

            {(role === 'editor' || role === 'admin') && (
              <Menu.Item
                render={<Link href="/admin" />}
                className="flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
              >
                {t('admin')}
              </Menu.Item>
            )}

            <Menu.Separator className="my-1 h-px bg-border" />

            <Menu.Item className="flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground text-destructive focus:text-destructive">
              <form action={signOutAction} className="w-full">
                <button type="submit" className="w-full text-left">
                  {t('signOut')}
                </button>
              </form>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
