import './globals.css';

// Minimal root layout — fonts, ThemeProvider, and <html> are in [locale]/layout.tsx
// Route handlers (auth/callback) use this shell; page routes get the locale layout.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
