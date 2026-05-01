export const metadata = {
  title: 'Terms of Service — Stuti Geet',
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 prose prose-sm dark:prose-invert">
      <h1>Terms of Service</h1>
      <p className="lead">Last updated: May 2026</p>

      <h2>1. Use of Content</h2>
      <p>
        Stuti Geet provides Hindi Christian worship lyrics and chord sheets for personal,
        non-commercial, and congregational worship use. Redistribution for commercial purposes
        is prohibited without explicit written permission.
      </p>

      <h2>2. Copyright</h2>
      <p>
        Songs on this site have varying copyright statuses, displayed individually on each song
        page. Verified songs are marked accordingly. Unverified content may be pending review.
        If you believe any content infringes your copyright, please use the{' '}
        <a href="/legal/dmca">DMCA report form</a>.
      </p>

      <h2>3. Accuracy</h2>
      <p>
        Chord sheets and lyrics are provided as-is. We make reasonable efforts to ensure
        accuracy but make no warranty as to the correctness of musical notation or translations.
      </p>

      <h2>4. User Accounts</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account and for all
        activities that occur under it. We reserve the right to terminate accounts that violate
        these terms.
      </p>

      <h2>5. Changes</h2>
      <p>
        We may update these terms from time to time. Continued use of the site constitutes
        acceptance of the revised terms.
      </p>

      <h2>6. Contact</h2>
      <p>
        For questions about these terms, contact us via the{' '}
        <a href="/legal/dmca">copyright concern form</a>.
      </p>
    </main>
  );
}
