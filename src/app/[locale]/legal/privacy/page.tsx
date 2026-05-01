export const metadata = {
  title: 'Privacy Policy — Stuti Geet',
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 prose prose-sm dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p className="lead">Last updated: May 2026</p>

      <h2>1. Information We Collect</h2>
      <p>
        When you create an account, we collect your email address and any profile information
        you provide (display name, avatar URL from Google OAuth). We do not collect unnecessary
        personal data.
      </p>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To authenticate you and maintain your session.</li>
        <li>To attribute song contributions to your display name.</li>
        <li>To respond to copyright takedown requests you submit.</li>
      </ul>

      <h2>3. Analytics</h2>
      <p>
        We use privacy-respecting analytics (Plausible) that do not use cookies or track
        individuals. No personal data is sent to analytics providers.
      </p>

      <h2>4. Data Retention</h2>
      <p>
        Account data is retained while your account is active. You may request deletion of
        your account and associated data by contacting us.
      </p>

      <h2>5. Third Parties</h2>
      <p>
        We use Supabase for database and authentication, and Vercel for hosting. Both
        providers have their own privacy policies. We do not sell your data to any third party.
      </p>

      <h2>6. Contact</h2>
      <p>
        For privacy concerns, use the <a href="/legal/dmca">copyright concern form</a> or
        contact the site administrator.
      </p>
    </main>
  );
}
