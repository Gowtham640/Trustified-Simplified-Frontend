import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Trustified Simplified - Fitness Supplement Testing & Reports",
  description: "Comprehensive lab testing and transparent reports for fitness supplements. Find trusted reviews of protein powders, creatine, omega-3, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="h7G_P0LjYfJbTdab0lcaBbHZXssCIetEaOb8YY0kWM4" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=optional&icon_names=lab_research,microbiology,rate_review" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" href="/favicon-96x96.png" sizes="96x96" type="image/png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${sora.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
