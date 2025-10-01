import "./globals.css"

export const metadata = {
  title: "Auction App",
  description: "Auction app",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-gray-100">
        {children}
      </body>
    </html>
  )
}
