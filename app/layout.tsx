import { Metadata } from 'next';
import { Asul, JetBrains_Mono } from 'next/font/google';
import { PropsWithChildren } from 'react';
import { BackgroundBeams, ErrorBoundary, Header } from './_components';
import './globals.css';
import ReactQueryProvider from './providers/ReactQueryProvider';

export const metadata: Metadata = {
  title: 'Viennalytics - Chess Opening Analysis',
  description:
    'Comprehensive analysis of chess openings, strategies, and player performance',
  keywords: 'chess, openings, analysis, strategy, vienna, analytics',
  authors: [{ name: 'Viennalytics Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Viennalytics - Chess Opening Analysis',
    description:
      'Comprehensive analysis of chess openings, strategies, and player performance',
    type: 'website',
  },
  other: {
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

const asul = Asul({
  weight: '400',
  variable: '--font-asul',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  weight: '700',
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const RootLayout = ({ children }: Readonly<PropsWithChildren>) => (
  <html lang='en'>
    <head>
      <meta charSet='utf-8' />
      <meta name='theme-color' content='#ea580c' />
      <link rel='icon' href='/favicon.ico' />
    </head>
    <body className={`${asul.variable} ${jetbrainsMono.variable} antialiased`}>
      <BackgroundBeams />
      <ReactQueryProvider>
        <ErrorBoundary>
          <div className='flex flex-col min-h-screen gap-6 p-4'>
            <Header />
            {children}
          </div>
        </ErrorBoundary>
      </ReactQueryProvider>
    </body>
  </html>
);

export default RootLayout;
