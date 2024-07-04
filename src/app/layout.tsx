import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Patient Pad",
  description: "End 2 End encrypted vault for your health data",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >      
        <div vaul-drawer-wrapper="" className="bg-background">
          {children}
        </div>
        <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
