import './globals.css'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'QR Menü ve Garson Çağırma Sistemi',
  description: 'Dijital menü ve garson çağırma sistemi',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'QR Menü',
  },
  verification: {
    google: '46KkWPa71hTOq9ZlYw1kfiiVXZ5rV5kajZiQrSzjq8w',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ea580c',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="QR Menü" />
      </head>
      <body className="flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
