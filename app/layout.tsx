import type { Metadata } from 'next';
import './globals.css';
import './extra.css';

export const metadata: Metadata = {
  title: 'MasterYAI — Your AI Content Manager',
  description: 'Discover, create, schedule and publish social content with AI.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
