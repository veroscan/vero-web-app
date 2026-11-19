import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@fontsource/figtree/400.css';
import '@fontsource/figtree/500.css';
import '@fontsource/figtree/600.css';
import '@fontsource/figtree/700.css';
import './styles/vero.css';
import './styles/screens.css';
import './styles/app.css';
import { ThemeSync } from '@/components/Theme';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: { default: 'Vero Scan', template: '%s | Vero Scan' },
  description: 'Know exactly where your company stands.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

/**
 * Runs before the first paint, so a dark-mode reader never sees a white flash. A saved choice
 * wins. Until there is one, the page follows the system.
 */
const THEME_SCRIPT = `(function(){var t=null;try{t=localStorage.getItem('vero-theme')}catch(e){}if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <ThemeSync />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
