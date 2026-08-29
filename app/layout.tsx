import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/**
 * Design-system fonts, self-hosted through `next/font` rather than a
 * Google Fonts `<link>`: this app opens and closes dozens of times a day
 * over a weak lake-side connection, and self-hosting skips that
 * render-blocking round trip. Weights match what the Stitch reference
 * actually loads (docs/referencia/stitch/ingreso-al-sistema--movil.html).
 */
const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["500"],
});

export const metadata: Metadata = {
  title: "Arenal Water Sports — Operaciones",
  description:
    "Sistema interno de operaciones de Arenal Water Sports.",
};

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  width: "device-width",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element => (
  <html lang="es">
    <head>
      {/*
        Material Symbols Outlined stays on Google's CDN instead of
        next/font: it is a single variable icon font keyed by ligature
        name (see MaterialIcon) across FILL/weight/grade/optical-size
        axes, and next/font's self-hosting pipeline does not carry those
        axes the way a plain text webfont works. The two text fonts above
        are self-hosted; this is the one deliberate exception.
      */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
      />
    </head>
    <body
      className={`${hankenGrotesk.variable} ${jetbrainsMono.variable} bg-background text-on-background antialiased`}
    >
      {children}
    </body>
  </html>
);

export default RootLayout;
