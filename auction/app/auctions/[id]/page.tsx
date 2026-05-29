"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuctionDetails() {
  const { id } = useParams()
  const router = useRouter()
  const [auction, setAuction] = useState<any>(null)
  const [bids, setBids] = useState<any[]>([])
  const [bidAmount, setBidAmount] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // ✅ Fetch auction details
  useEffect(() => {
    if (!id) return
    fetch(`https://auction-hyt6.onrender.com/api/auctions/${id}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch auction")
        return res.json()
      })
      .then((data) => setAuction(data))
      .catch(() => router.push("/auctions"))
  }, [id, router])

  // ✅ Fetch bids
  useEffect(() => {
    if (!id) return
    fetch(`https://auction-hyt6.onrender.com/api/bids/${id}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setBids(data))
      .catch(() => setBids([]))
  }, [id])

  // ✅ Fetch logged-in user (for winner check)
  useEffect(() => {
    fetch(`https://auction-hyt6.onrender.com/api/users/profile`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((user) => setCurrentUserId(user._id))
      .catch(() => setCurrentUserId(null))
  }, [])

  // ✅ Place bid
  const handleBid = async () => {
    if (!bidAmount) return alert("Please enter a bid amount")
    try {
      const res = await fetch(`https://auction-hyt6.onrender.com/api/bids/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: Number(bidAmount) }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to place bid")
      }

      alert("✅ Bid placed successfully!")
      setBidAmount("")

      // Refresh bids & auction info
      setBids((prev) => [data.bid, ...prev])
      setAuction((prev: any) => ({
        ...prev,
        currentPrice: data.bid.amount,
        winner: data.bid.bidder,
      }))
    } catch (err: any) {
      console.error("❌ Bid Error:", err.message)
      alert(err.message)
    }
  }

  if (!auction) return <p className="text-center mt-20">Loading auction...</p>

  const isEnded =
    auction.status === "ended" || new Date(auction.endTime) < new Date()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Navbar */}
      <Navbar />

      <main className="pt-16 px-4 pb-8 max-w-lg mx-auto space-y-6">
        {/* Artwork Preview */}
        <div className="w-full h-64 rounded-lg overflow-hidden shadow-md bg-gray-200">
          {auction.artwork?.imageUrl ? (
            <img
              src={auction.artwork.imageUrl}
              alt={auction.artwork.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No Image
            </div>
          )}
        </div>

        {/* Auction Info */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">
              {auction.artwork.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-gray-600">{auction.artwork.description}</p>
            <p className="text-sm text-gray-500">
              Starting Price: ${auction.startPrice}
            </p>
            <p className="text-sm font-semibold">
              Current Price: ${auction.currentPrice || auction.startPrice}
            </p>
            <p className="text-sm">
              Status:{" "}
              {isEnded ? (
                <span className="text-red-500 font-medium">Ended</span>
              ) : (
                <span className="text-green-600 font-medium">Active</span>
              )}
            </p>

            {isEnded && auction.winner && (
              <div className="mt-3 space-y-3">
                <p className="text-blue-600 font-semibold">
                  🏆 Winner: {auction.winner.username}
                </p>

                {/* ✅ Show Pay button if current user is the winner */}
                {currentUserId === auction.winner._id && (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => router.push(`/payment/${auction._id}`)}
                  >
                    💳 You are the Winner — Pay Now
                  </Button>
                )}
              </div>
            )}

            {/* ✅ Place Bid */}
            {!isEnded && (
              <div className="flex gap-2 mt-4">
                <input
                  type="number"
                  placeholder="Enter bid amount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="border rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-indigo-500"
                />
                <Button onClick={handleBid}>Place Bid</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bids List */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>💰 Bids</CardTitle>
          </CardHeader>
          <CardContent>
            {bids.length === 0 ? (
              <p className="text-gray-500">No bids yet.</p>
            ) : (
              <ul className="space-y-2">
                {bids.map((bid) => (
                  <li
                    key={bid._id}
                    className="flex justify-between border-b pb-2 text-sm"
                  >
                    <span>
                      <strong>{bid.bidder.username}</strong> (${bid.amount})
                    </span>
                    <span className="text-gray-500">
                      {new Date(bid.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
