"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Menu, X } from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch("https://auction-hyt6.onrender.com/api/users/profile", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated")
        return res.json()
      })
      .then((data) => setUser(data))
      .catch(() => router.push("/login"))
  }, [router])

  const handleLogout = async () => {
    await fetch("http://localhost:5000/api/users/logout", {
      method: "POST",
      credentials: "include",
    })
    router.push("/login")
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-medium">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 🔹 Navbar */}
      <header className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center relative">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-10 w-10 object-cover rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none"
            }}
          />
          <span className="text-lg md:text-xl font-bold text-gray-800">
            Auction System
          </span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/profile" className="text-gray-700 hover:text-blue-600">
            Profile
          </Link>
          <Link
            href="/artworks/create"
            className="text-gray-700 hover:text-blue-600"
          >
            Create Artwork
          </Link>
          <Link
            href="/auctions/create"
            className="text-gray-700 hover:text-blue-600"
          >
            Create Auction
          </Link>
          <Link href="/bids/live" className="text-gray-700 hover:text-blue-600">
            Live Bids
          </Link>
          <Link href="/status" className="text-gray-700 hover:text-blue-600">
            Status
          </Link>
          <Button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2"
          >
            Logout
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-800"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="absolute right-6 top-16 bg-white border border-gray-200 rounded-lg shadow-md flex flex-col w-48 z-50">
            <Link
              href="/profile"
              className="px-4 py-2 hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              Profile
            </Link>
            <Link
              href="artist/create"
              className="px-4 py-2 hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              Create Artwork
            </Link>
            <Link
              href="artist/create-auction"
              className="px-4 py-2 hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              Create Auction
            </Link>
            <Link
              href="/bids/active"
              className="px-4 py-2 hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              Live Bids
            </Link>
            <Link
              href="/status"
              className="px-4 py-2 hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              Status
            </Link>
            <Button
              onClick={handleLogout}
              className="m-2 bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2"
            >
              Logout
            </Button>
          </div>
        )}
      </header>

      {/* 🔹 Main content */}
      <main className="flex-1 p-6 flex flex-col md:flex-row gap-6">
        {/* Left column - Profile card */}
        <Card className="flex-1 rounded-2xl shadow-lg border border-gray-200 bg-white">
          <CardContent className="p-6 text-center space-y-4">
            <img
              src={`https://ui-avatars.com/api/?name=${user.username}&background=random`}
              alt="User Avatar"
              className="h-20 w-20 rounded-full mx-auto object-cover"
            />
            <h2 className="text-2xl font-semibold text-gray-800">
              {user.username}
            </h2>
            <p className="text-gray-600">
              Role: <span className="font-medium">{user.role}</span>
            </p>
            <p className="text-gray-600">
              Email: <span className="font-medium">{user.email}</span>
            </p>
          </CardContent>
        </Card>

        {/* Right column - Activity */}
        <Card className="flex-1 rounded-2xl shadow-lg border border-gray-200 bg-white">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Recent Activity
            </h3>
            <p className="text-gray-600">
              Here you can show the user’s recent auctions, bids, or stats.
            </p>
            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
              <li>Created "Abstract Art #12" Auction</li>
              <li>Placed a bid on "Modern Sculpture"</li>
              <li>Updated profile info</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
