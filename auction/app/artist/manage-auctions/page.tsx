"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/Navbar"

export default function ManageAuctions() {
  const [auctions, setAuctions] = useState<any[]>([])
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<"upcoming" | "active" | "ended">("active")

  // ✅ Fetch auctions
  useEffect(() => {
    fetch("https://auction-hyt6.onrender.com/api/auctions", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setAuctions(data))
      .catch(() => setError("Failed to load auctions"))
  }, [])

  // ✅ End auction
  const handleEnd = async (id: string) => {
    if (!confirm("Are you sure you want to end this auction?")) return
    try {
      const res = await fetch(`https://auction-hyt6.onrender.com/api/auctions/${id}/end`, {
        method: "PUT",
        credentials: "include",
      })
      if (res.ok) {
        setAuctions((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status: "ended" } : a))
        )
      } else {
        const data = await res.json()
        alert(data.error || "Failed to end auction")
      }
    } catch {
      alert("Error ending auction")
    }
  }

  // ✅ Delete auction
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this auction permanently?")) return
    try {
      const res = await fetch(`https://auction-hyt6.onrender.com/api/auctions/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (res.ok) {
        setAuctions((prev) => prev.filter((a) => a._id !== id))
      } else {
        const data = await res.json()
        alert(data.error || "Failed to delete auction")
      }
    } catch {
      alert("Error deleting auction")
    }
  }

  // ✅ Split categories
  const now = new Date()
  const upcoming = auctions.filter(
    (a) => new Date(a.startTime) > now && a.status !== "ended"
  )
  const active = auctions.filter(
    (a) =>
      new Date(a.startTime) <= now &&
      new Date(a.endTime) >= now &&
      a.status === "active"
  )
  const ended = auctions.filter(
    (a) => a.status === "ended" || new Date(a.endTime) < now
  )

  // ✅ Select correct list
  let filteredAuctions: any[] = []
  if (filter === "upcoming") filteredAuctions = upcoming
  if (filter === "active") filteredAuctions = active
  if (filter === "ended") filteredAuctions = ended

  // ✅ Auction Card component
  const AuctionCard = ({ auction }: { auction: any }) => (
    <div className="bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition flex flex-col justify-between">
      <div>
        <h2 className="font-bold text-lg truncate mb-1">
          {auction.artwork?.title}
        </h2>
        <p className="text-sm text-gray-600 mb-2">
          Status:{" "}
          <span
            className={
              auction.status === "ended"
                ? "text-red-500 font-semibold"
                : "text-green-600 font-semibold"
            }
          >
            {auction.status}
          </span>
        </p>
        <p className="text-sm">💵 Current Price: ${auction.currentPrice}</p>
        <p className="text-xs text-gray-500 mt-1">
          ⏳ Start: {new Date(auction.startTime).toLocaleString()}
        </p>
        <p className="text-xs text-gray-500">
          ⏰ End: {new Date(auction.endTime).toLocaleString()}
        </p>

        {/* Winner when ended */}
        {auction.status === "ended" && auction.winner && (
          <p className="text-green-700 text-sm font-semibold mt-2">
            🏆 Winner: {auction.winner.username} (${auction.currentPrice})
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 space-y-2">
        {auction.status === "active" && (
          <button
            onClick={() => handleEnd(auction._id)}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg"
          >
            End Auction
          </button>
        )}
        <button
          onClick={() => handleDelete(auction._id)}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
        >
          Delete
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Navbar */}
      <Navbar onLogout={() => {}} />

      <main className="p-6 max-w-6xl mx-auto mt-20">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
          ⚡ Manage Auctions
        </h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* FILTER BUTTONS */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
              filter === "upcoming"
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            📅 Upcoming
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
              filter === "active"
                ? "bg-green-600 text-white shadow"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            🔥 Active
          </button>
          <button
            onClick={() => setFilter("ended")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
              filter === "ended"
                ? "bg-red-600 text-white shadow"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            ✅ Ended
          </button>
        </div>

        {/* AUCTIONS GRID */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAuctions.length > 0 ? (
            filteredAuctions.map((auction) => (
              <AuctionCard key={auction._id} auction={auction} />
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full bg-white p-6 rounded-xl shadow">
              No auctions found for{" "}
              <span className="font-semibold capitalize">{filter}</span>.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
