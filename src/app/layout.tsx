import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "コミュニケーションSST | Web受託開発トレーニング",
  description: "Web受託開発におけるコミュニケーションスキルを訓練するアプリ。AIがクライアント役となり、要件確認、技術翻訳、合意形成などの実践的なスキルを身につけられます。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
