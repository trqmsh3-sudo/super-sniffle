import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClearPick.ai — Stop Guessing. Start Knowing.',
  description:
    'AI-powered product research across 50+ trusted sources. Honest scores, real reviews, no affiliate spin.',
  openGraph: {
    title: 'ClearPick.ai — Stop Guessing. Start Knowing.',
    description:
      'AI-powered product research across 50+ trusted sources. Honest scores, real reviews.',
    type: 'website',
    siteName: 'ClearPick.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClearPick.ai',
    description: 'Stop guessing. Start knowing. AI-powered product research.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,700,500,400&f[]=satoshi@700,500,400&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased bg-[#0A0A0F] text-white">
        {children}
      </body>
    </html>
  );
}
