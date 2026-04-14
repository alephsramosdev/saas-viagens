import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nossas Viagens - Diário de Viagens",
  description: "Mapa interativo para registrar e planejar viagens em casal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body>{children}</body>
    </html>
  );
}
