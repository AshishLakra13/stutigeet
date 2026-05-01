'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';

const UpdateProfileSchema = z.object({
  display_name: z.string().min(1, 'Name is required').max(60, 'Name is too long').trim(),
});

type UpdateProfileState = { error?: string; success?: boolean };

export async function updateProfile(
  _prev: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: 'Not signed in.' };

  const result = UpdateProfileSchema.safeParse({
    display_name: formData.get('display_name'),
  });
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ display_name: result.data.display_name })
    .eq('id', profile.id);

  if (error) return { error: error.message };

  revalidatePath('/account');
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
