import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Konfigurator wycen — balustrady metalowe',
  description: 'Wyceń balustradę online w kilka sekund',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
