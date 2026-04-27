export type Season =
  | 'advent'
  | 'christmas'
  | 'epiphany'
  | 'lent'
  | 'holy_week'
  | 'easter'
  | 'pentecost'
  | 'ordinary_time';

export type Verse = {
  hi: string;
  en: string;
  citation_hi: string;
  citation_en: string;
};

export const VERSES_BY_SEASON: Record<Season, Verse> = {
  advent: {
    hi: 'जंगल में एक पुकारने वाले का शब्द आता है: प्रभु का मार्ग तैयार करो',
    en: 'A voice of one calling in the wilderness: Prepare the way for the Lord.',
    citation_hi: 'यशायाह ४०:३',
    citation_en: 'Isaiah 40:3',
  },
  christmas: {
    hi: 'आज दाऊद के नगर में तुम्हारे लिये एक उद्धारकर्ता उत्पन्न हुआ है',
    en: 'Today in the town of David a Savior has been born to you.',
    citation_hi: 'लूका २:११',
    citation_en: 'Luke 2:11',
  },
  epiphany: {
    hi: 'उठ, प्रकाशमान हो, क्योंकि तेरा प्रकाश आ गया है',
    en: 'Arise, shine, for your light has come.',
    citation_hi: 'यशायाह ६०:१',
    citation_en: 'Isaiah 60:1',
  },
  lent: {
    hi: 'हे परमेश्वर, मेरे अन्दर शुद्ध मन उत्पन्न कर',
    en: 'Create in me a pure heart, O God.',
    citation_hi: 'भजन संहिता ५१:१०',
    citation_en: 'Psalm 51:10',
  },
  holy_week: {
    hi: 'वह मृत्यु तक, वरन् क्रूस की मृत्यु तक आज्ञाकारी रहा',
    en: 'He humbled himself, becoming obedient to death — even death on a cross.',
    citation_hi: 'फिलिप्पियों २:८',
    citation_en: 'Philippians 2:8',
  },
  easter: {
    hi: 'वह यहाँ नहीं है, वह जी उठा है',
    en: 'He is not here; he has risen, just as he said.',
    citation_hi: 'मत्ती २८:६',
    citation_en: 'Matthew 28:6',
  },
  pentecost: {
    hi: 'मैं अपनी आत्मा में से सब मनुष्यों पर उण्डेलूँगा',
    en: 'I will pour out my Spirit on all people.',
    citation_hi: 'प्रेरितों २:१७',
    citation_en: 'Acts 2:17',
  },
  ordinary_time: {
    hi: 'यहोवा के लिये एक नया गीत गाओ',
    en: 'Sing to the LORD a new song.',
    citation_hi: 'भजन संहिता ९६:१',
    citation_en: 'Psalm 96:1',
  },
};

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function easterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function adventStart(year: number): Date {
  // Advent starts on the Sunday falling between Nov 27 and Dec 3
  for (let offset = 0; offset <= 6; offset++) {
    const d = new Date(year, 10, 27 + offset); // Nov 27+
    if (d.getDay() === 0) return d;
  }
  return new Date(year, 10, 27);
}

export function getCurrentSeason(date: Date): Season {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateOnly = new Date(year, month - 1, day);

  const easter = easterDate(year);
  const ashWednesday = addDays(easter, -46);
  const palmSunday = addDays(easter, -7);
  const pentecostSunday = addDays(easter, 49);
  const advent = adventStart(year);

  // Advent: Advent Sunday through Dec 24
  if (dateOnly >= advent && (month < 12 || day <= 24)) return 'advent';

  // Christmas: Dec 25 through Jan 5
  if ((month === 12 && day >= 25) || (month === 1 && day <= 5)) return 'christmas';

  // Epiphany: Jan 6 through Ash Wednesday eve
  const epiphanyStart = new Date(year, 0, 6);
  if (dateOnly >= epiphanyStart && dateOnly < ashWednesday) return 'epiphany';

  // Lent: Ash Wednesday through Palm Sunday eve
  if (dateOnly >= ashWednesday && dateOnly < palmSunday) return 'lent';

  // Holy Week: Palm Sunday through Holy Saturday
  if (dateOnly >= palmSunday && dateOnly < easter) return 'holy_week';

  // Easter: Easter Sunday through Pentecost eve
  if (dateOnly >= easter && dateOnly < pentecostSunday) return 'easter';

  // Pentecost Sunday
  if (dateOnly.getTime() === pentecostSunday.getTime()) return 'pentecost';

  return 'ordinary_time';
}
