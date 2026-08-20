import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';

import { Providers } from './providers';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Weather Prediction — real-time forecasts, air quality and alerts',
    template: '%s · Weather Prediction',
  },
  description:
    'A real-time weather dashboard: current conditions, 24-hour and 7-day forecasts, air quality, UV, severe-weather alerts and temperature trends for any city on earth.',
  applicationName: 'Weather Prediction',
  authors: [{ name: 'Mithran MV', url: 'https://github.com/Mithran-MV' }],
  keywords: ['weather', 'forecast', 'air quality', 'dashboard', 'Next.js', 'React'],
  openGraph: {
    type: 'website',
    siteName: 'Weather Prediction',
    title: 'Weather Prediction',
    description:
      'Real-time conditions, hourly and 7-day forecasts, air quality and severe-weather alerts.',
    url: siteUrl,
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-slate-900"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
