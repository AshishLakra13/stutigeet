import 'server-only';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

type SongForGate = {
  copyright_status: string | null;
  verified_at: string | null;
};

type GateSettings = {
  enabled: boolean;
  grace_days: number;
};

const UNVERIFIED_STATUSES = new Set(['placeholder', 'unverified']);

// Reads the site_settings row once per request via React cache().
const getGateSettings = cache(async (): Promise<GateSettings> => {
  if (process.env.STRICT_VERIFICATION_GATE === 'true') {
    return { enabled: true, grace_days: 30 };
  }
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'strict_verification_gate')
      .single();
    if (data?.value) return data.value as GateSettings;
  } catch {
    // Fall through to permissive default
  }
  return { enabled: false, grace_days: 30 };
});

// Returns true if the song's lyrics may be rendered publicly.
// Default (gate disabled): always true.
// Strict mode: false when copyright_status is unverified/placeholder
// AND the row is older than grace_days (or has no verified_at at all).
export const isLyricRenderingAllowed = cache(async (song: SongForGate): Promise<boolean> => {
  if (!UNVERIFIED_STATUSES.has(song.copyright_status ?? '')) return true;

  const settings = await getGateSettings();
  if (!settings.enabled) return true;

  if (!song.verified_at) return false;

  const graceCutoff = new Date();
  graceCutoff.setDate(graceCutoff.getDate() - settings.grace_days);
  return new Date(song.verified_at) >= graceCutoff;
});
