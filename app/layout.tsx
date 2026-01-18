import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A Surprise for You",
  description: "A birthday surprise — memories and love",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Poppins:wght@300;400;600;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-gradient-to-b from-pink-50 to-white" data-theme="light">
        {children}
      </body>
    </html>
  );
}
