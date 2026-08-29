import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
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

/**
 * Material Symbols Outlined, self-hosted for the same reason as the two
 * fonts above: a previous version of this file loaded it from Google's CDN
 * (`fonts.googleapis.com`) instead, and when that stylesheet does not load
 * — a bad lake-side connection, or a network policy like Cloudflare WARP
 * blocking it — every icon rendered as its literal ligature name
 * ("radio_button_unchecked") instead of a glyph. `next/font/google` cannot
 * load this one directly (it is not in its supported font list — confirmed
 * against `next/dist/compiled/@next/font/dist/google/font-data.json` and by
 * the TS2305 compiler error trying it), because it is a variable icon font
 * outside next/font's normal Google Fonts catalog. `next/font/local` is the
 * documented way around that: the woff2 below is Google's own **static**
 * instance of the font (weight 400, fill 0, grade 0, optical size 24 — the
 * same defaults `MaterialIcon` already rendered through the old CDN link,
 * since nothing in this codebase sets a variable-axis
 * `font-variation-settings`), not the ~4 MB variable version, which would
 * only add masters this app never uses. See `.material-symbols-outlined`
 * in `app/globals.css` for where the resulting `--font-material-symbols`
 * variable is consumed.
 */
const materialSymbolsOutlined = localFont({
  display: "block",
  src: "./fonts/MaterialSymbolsOutlined-static.woff2",
  variable: "--font-material-symbols",
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
    <body
      className={`${hankenGrotesk.variable} ${jetbrainsMono.variable} ${materialSymbolsOutlined.variable} bg-background text-on-background antialiased`}
    >
      {children}
    </body>
  </html>
);

export default RootLayout;
