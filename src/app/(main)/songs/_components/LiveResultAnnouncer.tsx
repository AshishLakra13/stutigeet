'use client';

type Props = {
  page: number;
  totalPages: number;
  from: number;
  to: number;
  total: number;
};

export function LiveResultAnnouncer({ page, totalPages, from, to, total }: Props) {
  const message =
    total === 0
      ? 'No songs found.'
      : `Page ${page} of ${totalPages}, showing songs ${from} to ${to} of ${total}.`;

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
