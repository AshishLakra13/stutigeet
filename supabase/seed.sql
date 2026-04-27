-- =============================================================
-- Stuti Geet — Seed Data (Phase 1 Demo)
-- Run AFTER schema.sql in Supabase Studio → SQL Editor
-- Replace this demo song with real worship content before launch
-- =============================================================

insert into songs (
  slug, title_hi, title_en, lyrics_chordpro,
  original_key, bpm, tempo, themes, language,
  copyright_status, copyright_notes
) values (
  'demo-stuti-geet',
  'स्तुति गीत (डेमो)',
  'Demo Praise Song',
  '{title: स्तुति गीत}
{subtitle: Demo Praise Song}
{key: G}
{tempo: 72}

{verse: 1}
[G]यीशु तेरा [D]नाम कितना [Em]प्यारा है
[C]हर दिल में तू [G]बसता [D]रहता [G]है
[G]तेरी महिमा [D]गाते हैं [Em]हम सब मिल
[C]तेरा ही [G]जय [D]जय [G]कार

{chorus}
[C]हल्ले[G]लूया [D]हल्ले[G]लूया
[C]तेरी [G]महिमा [D]गाते [G]हैं
[C]हल्ले[G]लूया [D]हल्ले[G]लूया
[Em]तू ही [C]प्रभु तू ही [G]राजा [D]है

{verse: 2}
[G]Holy is your [D]name above all [Em]names
[C]Forever you will [G]reign in [D]majes[G]ty
[G]We lift our voice [D]in praise to [Em]you alone
[C]Your love en[G]dures for[D]ever[G]more

{bridge}
[Em]तू ही मेरी [C]आशा है
[G]तू ही मेरी [D]शक्ति है
[Em]तेरे बिना [C]मैं कुछ नहीं
[G]यीशु तू ही [D]सब कुछ [G]है',
  'G',
  72,
  'mid',
  array['praise', 'demo'],
  array['hi', 'en'],
  'placeholder',
  'Demo song for Phase 1 testing — replace with real worship content before launch'
)
on conflict (slug) do update set
  title_hi = excluded.title_hi,
  title_en = excluded.title_en,
  lyrics_chordpro = excluded.lyrics_chordpro,
  original_key = excluded.original_key,
  bpm = excluded.bpm,
  tempo = excluded.tempo,
  themes = excluded.themes,
  language = excluded.language,
  copyright_status = excluded.copyright_status,
  copyright_notes = excluded.copyright_notes;
