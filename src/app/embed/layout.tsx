import { crimsonPro, inter, devanagari, devanagarSerif } from '@/lib/fonts';
import { ThemeProvider } from '@/components/theme-provider';
import '../globals.css';

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="hi"
      suppressHydrationWarning
      className={`${crimsonPro.variable} ${inter.variable} ${devanagari.variable} ${devanagarSerif.variable} antialiased`}
    >
      <body className="bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
