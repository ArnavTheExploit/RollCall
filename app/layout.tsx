import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RollCall - QR Based Attendance System",
  description: "Simple and efficient QR code-based attendance management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

