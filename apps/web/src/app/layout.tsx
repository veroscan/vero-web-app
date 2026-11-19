import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@fontsource/plus-jakarta-sans/300.css';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import './styles/kit.css';
import './styles/base.css';
import './styles/motion.css';
import './styles/kit-dark.css';
import { IconSprite } from '@/components/Icon';
import { RouteBar, SmoothScroll } from '@/components/Motion';
import { ThemeSync } from '@/components/Theme';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: { default: 'Vero', template: '%s | Vero' },
  description: 'Know exactly where any company stands, checked against the official registers.',
  robots: { index: false, follow: false },
  icons: { icon: '/brand/app-icon.svg' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#000066' };

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
        <link rel="preload" href="/fonts/LowresPixel-Regular.otf" as="font" type="font/otf" crossOrigin="" />
      </head>
      <body>
        <IconSprite />
        <ThemeSync />
        <SmoothScroll />
        <RouteBar />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
