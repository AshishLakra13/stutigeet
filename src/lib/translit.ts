// Bidirectional Roman ↔ Devanagari map for common Christian Hindi vocabulary.
// Roman → Devanagari: covers common spelling variants worshippers actually type.
// Used as Tier 3 fallback in the search chain when FTS and ILIKE return nothing.

const ROMAN_TO_DEVANAGARI: Record<string, string> = {
  // Jesus
  yeshu: 'यीशु',
  yishu: 'यीशु',
  jisu: 'यीशु',
  jesu: 'यीशु',
  ishu: 'यीशु',
  yisu: 'यीशु',
  jesus: 'यीशु',

  // Messiah
  masih: 'मसीह',
  masiha: 'मसीह',
  masseeh: 'मसीह',
  maseeh: 'मसीह',
  maseeha: 'मसीह',

  // Lord
  prabhu: 'प्रभु',
  praboo: 'प्रभु',
  prabbu: 'प्रभु',
  prabh: 'प्रभु',

  // God
  parmeshwar: 'परमेश्वर',
  parmeshvar: 'परमेश्वर',
  parmeshwara: 'परमेश्वर',
  parameshwar: 'परमेश्वर',
  ishwar: 'ईश्वर',
  khuda: 'खुदा',

  // Father
  pita: 'पिता',
  pitaa: 'पिता',

  // Holy
  pavitra: 'पवित्र',
  pavitr: 'पवित्र',
  holy: 'पवित्र',

  // Spirit
  aatma: 'आत्मा',
  atma: 'आत्मा',
  aatmaa: 'आत्मा',
  rooh: 'रूह',
  ruh: 'रूह',

  // Love
  prem: 'प्रेम',
  pyar: 'प्यार',
  pyaar: 'प्यार',
  muhabbat: 'मुहब्बत',

  // Song / Praise
  geet: 'गीत',
  git: 'गीत',
  stuti: 'स्तुति',
  stutti: 'स्तुति',
  bhajan: 'भजन',
  aradhana: 'आराधना',
  upasana: 'उपासना',

  // Grace / Mercy
  kripa: 'कृपा',
  kripaa: 'कृपा',
  daya: 'दया',
  rehmat: 'रहमत',

  // Cross
  salib: 'सलीब',
  saleeb: 'सलीब',
  krus: 'क्रूस',
  kroos: 'क्रूस',

  // Blood
  lahu: 'लहू',
  khoon: 'खून',

  // Salvation / Redemption
  mukti: 'मुक्ति',
  uddhaar: 'उद्धार',
  uddhar: 'उद्धार',
  bachao: 'बचाओ',

  // Heaven
  swarg: 'स्वर्ग',
  swargg: 'स्वर्ग',
  jannat: 'जन्नत',
  asman: 'आसमान',

  // Kingdom
  rajya: 'राज्य',

  // Prayer
  prarthana: 'प्रार्थना',
  praarthanaa: 'प्रार्थना',
  dua: 'दुआ',

  // Hallelujah / Amen
  hallelujah: 'हलेलूयाह',
  halleluyah: 'हलेलूयाह',
  amen: 'आमीन',

  // Return / Coming
  aao: 'आओ',
  aa: 'आ',
};

// Devanagari → set of Roman representations (for toRoman helper)
const DEVANAGARI_TO_ROMAN: Record<string, string[]> = {};
for (const [roman, dev] of Object.entries(ROMAN_TO_DEVANAGARI)) {
  if (!DEVANAGARI_TO_ROMAN[dev]) DEVANAGARI_TO_ROMAN[dev] = [];
  DEVANAGARI_TO_ROMAN[dev].push(roman);
}

const DEVANAGARI_RANGE = /[ऀ-ॿ]/;

/** True when the string is purely ASCII (no Devanagari characters). */
export function isRomanScript(text: string): boolean {
  return !DEVANAGARI_RANGE.test(text);
}

/**
 * Given a Roman-script query, returns up to 8 Devanagari candidate strings
 * to use as additional search terms. Each word in the query is looked up
 * independently; non-matching words are skipped.
 */
export function toDevanagariCandidates(query: string): string[] {
  const words = query.trim().toLowerCase().split(/\s+/);
  const seen = new Set<string>();

  for (const word of words) {
    const dev = ROMAN_TO_DEVANAGARI[word];
    if (dev) seen.add(dev);
  }

  return Array.from(seen).slice(0, 8);
}

/**
 * Returns the first known Roman representation of a Devanagari string.
 * Falls back to the string itself if not in the map.
 */
export function toRoman(devanagari: string): string {
  return DEVANAGARI_TO_ROMAN[devanagari]?.[0] ?? devanagari;
}
