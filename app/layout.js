import "./globals.css";
import { Archivo, Instrument_Sans } from "next/font/google";
import Link from "next/link";
import Nav from "./components/Nav";

const archivo = Archivo({ subsets: ["latin"], weight: ["500", "700", "900"], variable: "--font-archivo", display: "swap" });
const instrument = Instrument_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-instrument", display: "swap" });

export const metadata = {
  title: { default: "EvenTixr", template: "%s | EvenTixr" },
  description: "Tickets for concerts and events in Rwanda. Pay with MTN MoMo, get your ticket by SMS, show the QR code at the gate.",
  openGraph: { siteName: "EvenTixr", type: "website" },
};

export const viewport = { themeColor: "#1e1b3a" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${archivo.variable} ${instrument.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Nav />
        <div className="flex-1">{children}</div>
        <footer id="contact" className="mt-16 border-t border-mist bg-surface">
          <div className="page py-10 grid gap-8 sm:grid-cols-3 text-sm text-ink-soft">
            <div className="space-y-2">
              <div className="font-display font-bold text-ink text-lg">EvenTixr</div>
              <p>Tickets for concerts and events in Rwanda, paid with MTN MoMo and checked at the gate by QR code.</p>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-ink">Contact</div>
              <div>info@shapeherd.rw</div>
              <div>+250 788 317 413</div>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-ink">Organisers</div>
              <Link href="/signup" className="block hover:text-ink">Sell tickets for your event</Link>
              <Link href="/admin" className="block hover:text-ink">Log in</Link>
              <a href="https://shapeherd.rw/about/index.html" className="block hover:text-ink">A Shapeherd product</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
