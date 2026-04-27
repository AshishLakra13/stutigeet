'use client';

import { Search } from 'lucide-react';

export function SearchButton() {
  function handleClick() {
    document.dispatchEvent(new CustomEvent('command-palette:open'));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Open search"
      className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground transition-colors"
    >
      <Search className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
