import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { ContributeForm } from './ContributeForm';

export const metadata = {
  title: 'Submit a Song — Stuti Geet',
  description: 'Submit a new Hindi Christian worship song for review.',
};

export default async function ContributePage() {
  const profile = await getCurrentProfile();

  if (!profile) redirect('/login?next=/contribute');
  if (profile.role === 'viewer') redirect('/');

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Submit a new song</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Your submission will be reviewed by an editor before it appears publicly.
          Fill in as much detail as you know.
        </p>
      </div>
      <ContributeForm />
    </main>
  );
}
