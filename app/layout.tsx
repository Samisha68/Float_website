import type { Metadata } from "next";
import { Readex_Pro } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const readexPro = Readex_Pro({
  variable: "--font-readex-pro",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const imageUrl = `${protocol}://${host}/og.png`;

  return {
    title: "float — coming soon",
    description: "Credit that grows with you. Float is coming soon.",
    icons: {
      icon: "/float-favicon.svg",
      shortcut: "/float-favicon.svg",
    },
    openGraph: {
      title: "just float — coming soon",
      description: "Credit that grows with you.",
      images: [{ url: imageUrl, width: 1536, height: 1024 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "just float — coming soon",
      description: "Credit that grows with you.",
      images: [imageUrl],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${readexPro.variable} antialiased`}>{children}</body>
    </html>
  );
}
