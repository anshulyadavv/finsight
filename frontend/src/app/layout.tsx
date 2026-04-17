import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/hooks/useTheme';

export const metadata: Metadata = {
  title: 'FinSight — Personal Finance Intelligence',
  description: 'AI-powered personal finance dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className="dark">
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
