// app/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* ✅ Navbar */}
      <header className="w-full flex items-center justify-between px-6 py-4 shadow-md bg-white">
        <h1 className="text-2xl font-extrabold text-blue-600">🎨 AuctionHouse</h1>
      </header>

      {/* ✅ Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
        <h2 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
          Discover, Bid, and Win Amazing Artworks 🖼️
        </h2>
        <p className="text-gray-600 max-w-xl mb-6">
          Join our live auction platform where artists and collectors connect. 
          Place your bids in real time and own exclusive pieces.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            onClick={() => router.push("/signup")}
          >
            Get Started 🚀
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/login")}
          >
            Already have an account? Login
          </Button>
        </div>
      </main>

      {/* ✅ Features Section */}
      <section className="px-6 py-12 bg-gray-50">
        <h3 className="text-2xl font-bold text-center mb-8">
          Why Choose AuctionHouse?
        </h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          <div className="bg-white shadow-md rounded-xl p-6 text-center">
            <h4 className="font-semibold text-lg mb-2">🔒 Secure Bidding</h4>
            <p className="text-gray-600 text-sm">
              Place bids safely with our secure payment system.
            </p>
          </div>
          <div className="bg-white shadow-md rounded-xl p-6 text-center">
            <h4 className="font-semibold text-lg mb-2">🎨 Verified Artists</h4>
            <p className="text-gray-600 text-sm">
              Buy directly from trusted and verified artists.
            </p>
          </div>
          <div className="bg-white shadow-md rounded-xl p-6 text-center">
            <h4 className="font-semibold text-lg mb-2">⚡ Real-Time Updates</h4>
            <p className="text-gray-600 text-sm">
              Get live updates as auctions progress.
            </p>
          </div>
        </div>
      </section>

      {/* ✅ Footer */}
      <footer className="bg-white shadow-inner py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} AuctionHouse. All rights reserved.
      </footer>
    </div>
  )
}
