import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tablatura — editor de tablaturas",
  description: "Crie tablaturas de violão com rapidez e exporte em PDF.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
