import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JCB 卡片管理",
  description: "JCB 卡片自動加值回饋管理系統",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
