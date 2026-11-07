import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/shell/Footer";
import { Header } from "@/components/shell/Header";
import { Lightbox } from "@/components/shell/Lightbox";
import { Loader } from "@/components/shell/Loader";
import { MobileMenu } from "@/components/shell/MobileMenu";
import { PageTransition } from "@/components/shell/PageTransition";
import { RuntimeScripts } from "@/components/shell/RuntimeScripts";
import { JsonLd } from "@/components/ui/JsonLd";
import { PRE_HYDRATION_SCRIPT } from "@/lib/bootstrap";
import { SITE_JSON_LD } from "@/lib/jsonld";
import { SHELL_SCRIPTS } from "@/lib/runtime";
import "@/styles/fonts.css";
import "@/styles/app.css";
import "@/styles/vero.css";
import "@/styles/utilities.css";

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/vero/favicon.svg", type: "image/svg+xml" },
      { url: "/vero/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F6F5F7",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The boot script and the runtime add classes to <html> before and after hydration.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRE_HYDRATION_SCRIPT }} />
        <link rel="preload" href="/assets/fonts/figtree-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
        {/* The runtime starts after hydration; fetching it now keeps that start close to the static site's. */}
        {SHELL_SCRIPTS.map(({ src, module }) =>
          module ? <link key={src} rel="modulepreload" href={src} /> : <link key={src} rel="preload" href={src} as="script" />,
        )}
        {/* Declared here, not through the Metadata API, which would turn it into an absolute localhost URL until a domain is set. */}
        <meta property="og:image" content="/vero/og-default.jpg" />
        <JsonLd data={SITE_JSON_LD} shell />
      </head>
      <body>
        <Loader />
        <PageTransition />
        <Header />
        <MobileMenu />
        {children}
        <Footer />
        <Lightbox />
        <RuntimeScripts />
      </body>
    </html>
  );
}
