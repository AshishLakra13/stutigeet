import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://stutigeet.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: songs } = await supabase
    .from('songs')
    .select('slug, updated_at')
    .eq('is_published', true)
    .order('updated_at', { ascending: false });

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: { languages: { hi: `${BASE_URL}/`, en: `${BASE_URL}/en/` } },
    },
    {
      url: `${BASE_URL}/songs`,
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: { languages: { hi: `${BASE_URL}/songs`, en: `${BASE_URL}/en/songs` } },
    },
  ];

  const songPages: MetadataRoute.Sitemap = (songs ?? []).map((song) => ({
    url: `${BASE_URL}/songs/${song.slug}`,
    lastModified: song.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    alternates: {
      languages: {
        hi: `${BASE_URL}/songs/${song.slug}`,
        en: `${BASE_URL}/en/songs/${song.slug}`,
      },
    },
  }));

  return [...staticPages, ...songPages];
}
