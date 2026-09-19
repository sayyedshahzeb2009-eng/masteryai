import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MasterYAI — Your AI Content Manager',
  description: 'Create, schedule and automate social content with AI.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
