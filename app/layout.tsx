// CANONICAL root layout for Julley: fonts, metadata, viewport, favicon.
// Julley is permanently free with no accounts, so this layout carries no auth
// providers and no session logic. Page chrome (header/footer) lives in the
// route group layouts so the marketing landing page can own its own chrome.

import type { Metadata, Viewport } from 'next';
import { Outfit, Source_Sans_3 } from 'next/font/google';
import './globals.css';

const bodyFont = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const displayFont = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: 'Julley: any school topic, retold in your world and your language',
    template: '%s | Julley',
  },
  description:
    'Type a topic, your place, and your mother tongue. Julley retells the concept through your own surroundings in one of 37 languages, with one hands-on activity using free materials around you. Free forever, no account, nothing you type is stored.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Julley: any school topic, retold in your world and your language',
    description:
      'A free learning tool for students aged 10 to 18. Lessons composed natively in 37 languages, set in your own place, with one hands-on activity. No account, nothing stored.',
    type: 'website',
  },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23b45309'/%3E%3Ccircle cx='44' cy='21' r='7' fill='%23fcd34d'/%3E%3Cpath d='M8 50 L26 24 L38 42 L46 32 L58 50 Z' fill='%23fffbeb'/%3E%3C/svg%3E",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
