// Chromatic key list — flats preferred (friendlier for guitar/keys)
export const MAJOR_KEYS = [
  'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B',
];
export const MINOR_KEYS = MAJOR_KEYS.map((k) => `${k}m`);

/** Step the key up (+1) or down (-1) by one semitone */
export function nextKey(current: string, direction: 1 | -1): string {
  const isMinor = current.endsWith('m');
  const root = isMinor ? current.slice(0, -1) : current;
  const list = isMinor ? MINOR_KEYS : MAJOR_KEYS;
  const majorIdx = MAJOR_KEYS.indexOf(root);
  if (majorIdx === -1) return current;
  const nextMajorIdx = (majorIdx + direction + MAJOR_KEYS.length) % MAJOR_KEYS.length;
  return isMinor ? `${MAJOR_KEYS[nextMajorIdx]}m` : MAJOR_KEYS[nextMajorIdx];
}
