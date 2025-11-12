import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { SettingsProvider } from '@/app/context/SettingsContext';
import AppLayout from '@/components/client/AppLayout';

export const metadata: Metadata = {
  title: 'RemoteTouch',
  description: 'Remote control with a touch of AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased', 'overscroll-none')}>
        <SettingsProvider>
          <AppLayout>{children}</AppLayout>
          <Toaster />
        </SettingsProvider>
      </body>
    </html>
  );
}
