"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"

export default function CreateAuctionPage() {
  const [artworks, setArtworks] = useState<any[]>([])
  const [form, setForm] = useState({
    artworkId: "",
    startPrice: "",
    startTime: "",
    endTime: "",
  })
  const [error, setError] = useState("")
  const router = useRouter()

  // ✅ Fetch artist’s artworks (only their own)
  useEffect(() => {
    fetch("http://localhost:5000/api/artworks", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setArtworks(data))
      .catch(() => setError("Failed to load artworks"))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const res = await fetch("http://localhost:5000/api/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include", // ✅ send cookies
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to create auction")
        return
      }

      router.push("/dashboard")
    } catch {
      setError("Something went wrong")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ✅ Navbar at the top */}
      <Navbar />

      <main className="flex items-center justify-center p-6 mt-20">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 space-y-5"
        >
          <h1 className="text-2xl font-bold text-center text-gray-800">
            📢 Create Auction
          </h1>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Select Artwork */}
          <div>
            <label className="block text-sm font-medium mb-1">Select Artwork</label>
            <select
              name="artworkId"
              value={form.artworkId}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Choose your artwork</option>
              {artworks.map((art) => (
                <option key={art._id} value={art._id}>
                  {art.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Start Price ($)</label>
            <input
              type="number"
              name="startPrice"
              placeholder="e.g. 100"
              value={form.startPrice}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input
              type="datetime-local"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <input
              type="datetime-local"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition"
          >
            Create Auction
          </button>
        </form>
      </main>
    </div>
  )
}
