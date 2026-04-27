const NOTE_FREQUENCIES: Record<string, number> = {
  C: 261.63,
  'C#': 277.18, Db: 277.18,
  D: 293.66,
  'D#': 311.13, Eb: 311.13,
  E: 329.63,
  F: 349.23,
  'F#': 369.99, Gb: 369.99,
  G: 392.0,
  'G#': 415.3, Ab: 415.3,
  A: 440.0,
  'A#': 466.16, Bb: 466.16,
  B: 493.88,
};

function parseRootNote(chord: string): string {
  const match = chord.trim().match(/^([A-G][b#]?)/);
  return match ? match[1] : '';
}

export function playChordNote(chordName: string): void {
  try {
    const root = parseRootNote(chordName);
    const freq = NOTE_FREQUENCIES[root];
    if (!freq) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Short piano-like envelope: fast attack, quick exponential decay
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);

    // Clean up after playback
    osc.onended = () => ctx.close();
  } catch {
    // Web Audio API unavailable or blocked
  }
}

export const AUDIO_STORAGE_KEY = 'stuti.chord_audio';

export function getAudioEnabled(): boolean {
  try {
    return localStorage.getItem(AUDIO_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setAudioEnabled(enabled: boolean): void {
  try {
    if (enabled) {
      localStorage.setItem(AUDIO_STORAGE_KEY, '1');
    } else {
      localStorage.removeItem(AUDIO_STORAGE_KEY);
    }
  } catch {
    // localStorage unavailable
  }
}
