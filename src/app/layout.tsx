import Header from "@/components/layout/Header";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <Sidebar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
