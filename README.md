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

## Implementation plan

See [`../Christain Hindi Songs/IMPLEMENTATION_PLAN.md`](../Christain%20Hindi%20Songs/IMPLEMENTATION_PLAN.md) for the full phase-by-phase roadmap.
