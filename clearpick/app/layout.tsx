import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ClearPick.ai — AI-Powered Product Research',
  description:
    'Find any product instantly. AI-powered research across every brand and model — unbiased scores, real reviews, and honest recommendations.',
  openGraph: {
    title: 'ClearPick.ai — AI-Powered Product Research',
    description:
      'Find any product instantly. AI-powered research across every brand and model.',
    type: 'website',
    siteName: 'ClearPick.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClearPick.ai',
    description: 'AI-powered product research — honest scores and real reviews.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  );
}
