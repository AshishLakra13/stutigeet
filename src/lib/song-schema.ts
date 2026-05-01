import { z } from 'zod';

const COPYRIGHT_STATUSES = [
  'public_domain',
  'original',
  'licensed',
  'permission_granted',
  'placeholder',
] as const;

const TEMPOS = ['slow', 'mid', 'fast'] as const;

export const songSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),

  title_hi: z.string().optional().nullable(),
  title_en: z.string().optional().nullable(),

  lyrics_chordpro: z
    .string()
    .min(1, 'ChordPro lyrics are required'),

  lyrics_chordpro_en: z.string().optional().nullable(),

  original_key: z.string().optional().nullable(),

  bpm: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() !== '' ? parseInt(v, 10) : null))
    .pipe(z.number().int().min(20).max(300).nullable()),

  tempo: z.enum(TEMPOS).optional().nullable(),

  // Comma-separated string → string[]
  themes: z
    .string()
    .optional()
    .nullable()
    .transform((v) =>
      v
        ? v
            .split(',')
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean)
        : [],
    ),

  language: z
    .string()
    .optional()
    .nullable()
    .transform((v) =>
      v
        ? v
            .split(',')
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean)
        : ['hi'],
    ),

  artist_original: z.string().optional().nullable(),
  youtube_url: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  source_url: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  source_name: z.string().optional().nullable(),
  copyright_status: z.enum(COPYRIGHT_STATUSES).optional().nullable(),
  copyright_notes: z.string().optional().nullable(),
});

export type SongFormValues = z.infer<typeof songSchema>;

/** Parse raw FormData into a validated SongFormValues object. */
export function parseSongFormData(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  return songSchema.safeParse(raw);
}
