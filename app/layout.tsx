import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Budget Coach",
  description: "AI-powered personal finance coach for India",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
