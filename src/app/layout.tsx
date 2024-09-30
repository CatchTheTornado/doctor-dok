import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Doctor Dok",
  description: "End 2 End encrypted vault for your most precious data",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" sizes="180x180" href="/img/180.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/img/512.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/img/144.png" />
        <link rel="apple-touch-icon" sizes="128x128" href="/img/128.png" />
        <link rel="apple-touch-icon" sizes="1024x1024" href="/img/1024.png" />
        <link rel="apple-touch-icon" href="/img/1024.png" />

        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no"></meta>
      </head>
      <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >      
        <div vaul-drawer-wrapper="" className="bg-background touch-none">
          {children}
        </div>
        <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
