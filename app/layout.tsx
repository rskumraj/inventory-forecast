import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'inventory.ai — Inventory Intelligence',
  description: 'Know what is about to happen before it does',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F0F3F7]">{children}</body>
    </html>
  );
}
