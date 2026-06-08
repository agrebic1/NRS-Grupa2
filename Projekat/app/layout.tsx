import type { Metadata } from 'next';
import { Providers } from './providers';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'InterServ',
  description: 'Sistem za upravljanje servisnim intervencijama',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bs">
      <body className="min-h-screen bg-warm-cream antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
