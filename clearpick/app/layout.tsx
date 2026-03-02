import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ClearPick.ai — AI-Powered Product Research',
  description:
    'Find the best product instantly. AI-powered research across brands, models and real reviews — unbiased scores and honest recommendations.',
  openGraph: {
    title: 'ClearPick.ai — AI-Powered Product Research',
    description:
      'Find the best product instantly. AI-powered research across brands, models and real reviews.',
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
      <body className="min-h-screen bg-surface-bg antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
