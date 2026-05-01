import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { parseChordPro } from '@/lib/chordpro';
import type { Song } from 'chordsheetjs';

// Register Noto Sans Devanagari for Hindi text rendering
// Using Google Fonts CDN — replace with a self-hosted copy if needed for offline builds
Font.register({
  family: 'NotoDevanagari',
  src: 'https://fonts.gstatic.com/s/notosansdevanagari/v25/TuGoUUFzXI5FBtUq5a8bjKYTZjtgrbn0.ttf',
});

Font.register({
  family: 'NotoLatin',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2' },
  ],
});

const bandStyles = StyleSheet.create({
  page: { padding: 36, fontFamily: 'NotoLatin', fontSize: 10 },
  title: { fontSize: 18, fontFamily: 'NotoDevanagari', marginBottom: 4 },
  titleEn: { fontSize: 13, color: '#666', marginBottom: 16, fontStyle: 'italic' },
  section: { marginBottom: 14 },
  sectionLabel: { fontSize: 8, color: '#999', textTransform: 'uppercase', marginBottom: 3 },
  line: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 1 },
  chordText: { fontSize: 9, color: '#6b5de7', fontFamily: 'NotoLatin', minWidth: 20 },
  lyricText: { fontSize: 10, fontFamily: 'NotoDevanagari' },
  footer: { position: 'absolute', bottom: 20, left: 36, right: 36, fontSize: 8, color: '#bbb', textAlign: 'center' },
});

const congStyles = StyleSheet.create({
  page: { padding: 48, fontFamily: 'NotoDevanagari', fontSize: 14 },
  title: { fontSize: 24, marginBottom: 6 },
  titleEn: { fontSize: 14, color: '#666', marginBottom: 24, fontFamily: 'NotoLatin', fontStyle: 'italic' },
  section: { marginBottom: 18 },
  sectionLabel: { fontSize: 9, color: '#999', textTransform: 'uppercase', marginBottom: 4, fontFamily: 'NotoLatin' },
  lyricLine: { fontSize: 16, lineHeight: 1.5, marginBottom: 2 },
  footer: { position: 'absolute', bottom: 24, left: 48, right: 48, fontSize: 8, color: '#bbb', textAlign: 'center', fontFamily: 'NotoLatin' },
});

function extractSections(song: Song): { type: string; lines: { lyrics: string; chords: string[] }[] }[] {
  return song.paragraphs.map((para) => ({
    type: (para as { type?: string }).type ?? 'verse',
    lines: para.lines.map((line) => {
      let lyrics = '';
      const chords: string[] = [];
      for (const item of line.items) {
        const i = item as { lyrics?: string; chords?: string };
        if (i.lyrics !== undefined) lyrics += i.lyrics;
        if (i.chords) chords.push(i.chords);
      }
      return { lyrics: lyrics.trim(), chords };
    }).filter((l) => l.lyrics || l.chords.length > 0),
  })).filter((s) => s.lines.length > 0);
}

const SECTION_LABELS: Record<string, string> = {
  verse: 'Verse', chorus: 'Chorus', bridge: 'Bridge', prechorus: 'Pre-Chorus',
  intro: 'Intro', outro: 'Outro', tag: 'Tag',
};

export function BandPdf({
  titleHi, titleEn, lyricsChordpro, copyrightNote,
}: {
  titleHi: string | null;
  titleEn: string | null;
  lyricsChordpro: string;
  copyrightNote?: string | null;
}) {
  const song = parseChordPro(lyricsChordpro);
  const sections = extractSections(song);

  return (
    <Document>
      <Page size="A4" style={bandStyles.page}>
        {titleHi && <Text style={bandStyles.title}>{titleHi}</Text>}
        {titleEn && <Text style={bandStyles.titleEn}>{titleEn}</Text>}

        {sections.map((section, si) => (
          <View key={si} style={bandStyles.section}>
            <Text style={bandStyles.sectionLabel}>
              {SECTION_LABELS[section.type] ?? section.type}
            </Text>
            {section.lines.map((line, li) => (
              <View key={li} style={bandStyles.line}>
                {line.chords.length > 0 && (
                  <Text style={bandStyles.chordText}>{line.chords.join(' ')}{' '}</Text>
                )}
                <Text style={bandStyles.lyricText}>{line.lyrics}</Text>
              </View>
            ))}
          </View>
        ))}

        <Text style={bandStyles.footer}>
          {copyrightNote ?? 'Stuti Geet — stutigeet.com'}
        </Text>
      </Page>
    </Document>
  );
}

export function CongregationPdf({
  titleHi, titleEn, lyricsChordpro, copyrightNote,
}: {
  titleHi: string | null;
  titleEn: string | null;
  lyricsChordpro: string;
  copyrightNote?: string | null;
}) {
  const song = parseChordPro(lyricsChordpro);
  const sections = extractSections(song);

  return (
    <Document>
      <Page size="A4" style={congStyles.page}>
        {titleHi && <Text style={congStyles.title}>{titleHi}</Text>}
        {titleEn && <Text style={congStyles.titleEn}>{titleEn}</Text>}

        {sections.map((section, si) => (
          <View key={si} style={congStyles.section}>
            <Text style={congStyles.sectionLabel}>
              {SECTION_LABELS[section.type] ?? section.type}
            </Text>
            {section.lines.map((line, li) => (
              <Text key={li} style={congStyles.lyricLine}>{line.lyrics}</Text>
            ))}
          </View>
        ))}

        <Text style={congStyles.footer}>
          {copyrightNote ?? 'Stuti Geet — stutigeet.com'}
        </Text>
      </Page>
    </Document>
  );
}
