import { requireAdmin } from '@/lib/auth';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader email={profile.email} />
      <div className="flex-1 mx-auto w-full max-w-5xl px-4 py-8">
        {children}
      </div>
    </div>
  );
}
