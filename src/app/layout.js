import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

const noto_sans_thai = Noto_Sans_Thai({ subsets: ["latin"] });

export const metadata = {
  title: "Cather",
  description: "Cather with peerjs",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={noto_sans_thai.className}>
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
