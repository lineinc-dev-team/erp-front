import './globals.css'
import HeaderWrapper from '@/components/layout/HeaderWrapper'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <HeaderWrapper />
        {children}
      </body>
    </html>
  )
}
