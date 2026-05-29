"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Navbar from "@/components/Navbar"

export default function ArtistDashboard() {
  const [artworks, setArtworks] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    fetch("https://auction-hyt6.onrender.com/api/artworks", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setArtworks(data))
      .catch(() => router.push("/login"))
  }, [router])

  // ✅ Logout handler
  const handleLogout = async () => {
    await fetch("https://auction-hyt6.onrender.com/api/logout", {
      method: "POST",
      credentials: "include",
    })
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Navbar */}
      <Navbar onLogout={handleLogout} />

      <main className="p-6 max-w-7xl mx-auto mt-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800">🎨 My Artworks</h1>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push("/artist/create-art")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >
              ➕ Add Artwork
            </Button>
          </div>
        </div>

        {/* Artworks Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {artworks.length === 0 ? (
            <p className="text-gray-500 text-center col-span-full bg-white p-6 rounded-xl shadow">
              No artworks uploaded yet. Click{" "}
              <span className="font-semibold text-purple-600">Add Artwork</span>{" "}
              to create one!
            </p>
          ) : (
            artworks.map((art) => (
              <Card
                key={art._id}
                className="shadow-md rounded-2xl overflow-hidden hover:shadow-lg hover:scale-[1.01] transition"
              >
                {/* Image */}
                <div className="relative w-full h-56 bg-gray-100">
                  <img
                    src={art.imageUrl}
                    alt={art.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.png"
                    }}
                  />
                </div>

                {/* Content */}
                <CardHeader>
                  <CardTitle className="truncate text-lg font-semibold">
                    {art.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-gray-700">{art.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Start Price:{" "}
                    <span className="font-semibold text-gray-800">
                      ${art.startPrice || "N/A"}
                    </span>
                  </p>
                  <Button
                    onClick={() => router.push(`/artist/artwork/${art._id}`)}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    🔍 View Details
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
