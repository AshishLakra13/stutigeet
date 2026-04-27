import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="text-center space-y-3">
        <h1 className="font-[family-name:var(--font-crimson)] text-5xl font-semibold tracking-tight sm:text-7xl">
          Stuti Geet
        </h1>
        <p
          lang="hi"
          className="font-[family-name:var(--font-devanagari)] text-3xl text-muted-foreground sm:text-4xl"
        >
          स्तुति गीत
        </p>
      </div>

      <p className="font-[family-name:var(--font-inter)] text-muted-foreground text-sm max-w-sm text-center">
        Christian Hindi worship songs — chord sheets, transposition, and set lists for your worship team.
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        <Button>Browse Songs</Button>
        <Button variant="outline">View Sets</Button>
      </div>

      <p
        lang="hi"
        className="font-[family-name:var(--font-devanagari)] text-xs text-muted-foreground"
      >
        यीशु तेरा नाम कितना प्यारा है
      </p>
    </main>
  );
}
