import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import  Header  from "@/components/Header";
import ReduxWrapper from "@/components/ReduxWrapper";

const inter = Inter({ subsets: ["latin"] });

 const metadata: Metadata = {
  title: "AgroRate – Indian Livestock & Market Platform",
  description: "Daily market rates and marketplace for livestock and products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ReduxWrapper>
          <Header />
          <Providers>{children}</Providers>
        </ReduxWrapper>
      </body>
    </html>
  );
}
