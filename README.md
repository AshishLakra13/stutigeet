# Stuti Geet — स्तुति गीत

Christian Hindi worship song site — chord sheets, transposition, and set lists for worship teams.

**Stack:** Next.js 16 · Supabase · Vercel · Tailwind v4 · shadcn/ui · ChordSheetJS

---

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values from your Supabase project (Settings → API):

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — server only, never expose to client |

Also add these to Vercel → Project → Settings → Environment Variables.

## Database setup

Run these SQL files in **Supabase Studio → SQL Editor** (in order):

1. `supabase/schema.sql` — creates the `songs` table, indexes, RLS policies
2. `supabase/seed.sql` — inserts 1 demo song for Phase 1 testing

Then verify: Studio → Table Editor → `songs` table should have 1 row with slug `demo-stuti-geet`.

To add real worship songs: use the Studio row editor — paste ChordPro into `lyrics_chordpro`, set `original_key`, `bpm`, etc.

## Implementation plan

See [`../Christain Hindi Songs/IMPLEMENTATION_PLAN.md`](../Christain%20Hindi%20Songs/IMPLEMENTATION_PLAN.md) for the full phase-by-phase roadmap.
