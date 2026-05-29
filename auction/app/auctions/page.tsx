// app/auctions/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Navbar from "../../components/userNavbar" // ✅ import Navbar

export default function AuctionList() {
  const [auctions, setAuctions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await fetch("https://auction-hyt6.onrender.com/api/auctions")
        const data = await res.json()

        const auctionArray = Array.isArray(data) ? data : data.auctions || []
        const activeAuctions = auctionArray.filter(
          (a: any) => new Date(a.endTime) > new Date()
        )

        setAuctions(activeAuctions)
      } catch (err) {
        console.error("❌ Fetch auctions error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAuctions()
  }, [])

  if (loading) return <p className="text-center mt-20">⏳ Loading auctions...</p>

  if (!auctions.length) {
    return <p className="text-center mt-20">🚫 No active auctions right now.</p>
  }

  return (
    <div>
      {/* ✅ Navbar fixed on top */}
      <Navbar />

      <main className="pt-20 px-4 pb-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">🔥 Active Auctions</h1>

        {/* ✅ Responsive Grid (1 col on mobile, 2 on md, 3 on lg) */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {auctions.map((auction) => (
            <Card
              key={auction._id}
              className="flex flex-col justify-between shadow-md rounded-xl overflow-hidden hover:scale-[1.01] transition"
            >
              <CardHeader>
                <CardTitle className="truncate">
                  {auction.artwork?.title || "Untitled Artwork"}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2">
                <p>🎨 <span className="font-medium">Artist:</span> {auction.artwork?.artist || "Unknown"}</p>
                <p>💰 <span className="font-medium">Start Price:</span> ${auction.startingPrice}</p>
                <p>
                  ⏳ <span className="font-medium">Ends:</span>{" "}
                  {new Date(auction.endTime).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>

                {/* ✅ View Details button */}
                <Button
                  onClick={() => router.push(`/auctions/${auction._id}`)}
                  className="mt-3 w-full"
                >
                  🔍 View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
