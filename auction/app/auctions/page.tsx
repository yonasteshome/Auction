// app/auctions/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Navbar from "../../components/userNavbar" // ✅ import Navbar

export default function AuctionList() {
  const [auctions, setAuctions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("active")
  const [sortBy, setSortBy] = useState("ending-soon")
  const router = useRouter()

  const queryString = useMemo(() => {
    const params = new URLSearchParams()

    if (searchTerm.trim()) params.set("q", searchTerm.trim())
    if (statusFilter !== "all") params.set("status", statusFilter)
    if (sortBy) params.set("sort", sortBy)

    return params.toString()
  }, [searchTerm, statusFilter, sortBy])

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await fetch(
          `https://auction-hyt6.onrender.com/api/auctions${queryString ? `?${queryString}` : ""}`
        )
        const data = await res.json()

        setAuctions(Array.isArray(data) ? data : data.auctions || [])
      } catch (err) {
        console.error("❌ Fetch auctions error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAuctions()
  }, [queryString])

  if (loading) return <p className="text-center mt-20">⏳ Loading auctions...</p>

  if (!auctions.length) {
    return (
      <div>
        <Navbar />
        <main className="pt-20 px-4 pb-8 max-w-6xl mx-auto">
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <h1 className="text-2xl font-bold mb-3">No auctions match your filters</h1>
            <p className="text-gray-600 mb-6">Try a different search, sort order, or status filter.</p>
            <Button variant="outline" onClick={() => {
              setSearchTerm("")
              setStatusFilter("all")
              setSortBy("ending-soon")
            }}>
              Reset filters
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      {/* ✅ Navbar fixed on top */}
      <Navbar />

      <main className="pt-20 px-4 pb-8 max-w-6xl mx-auto">
        <section className="mb-6 rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Browse auctions</p>
              <h1 className="mt-2 text-3xl font-black">Find the right auction faster</h1>
              <p className="mt-2 max-w-2xl text-slate-300">
                Search by artwork title or seller, switch between active and upcoming auctions, and sort by
                closing time, price, or recency.
              </p>
            </div>
            <Button asChild variant="secondary" className="text-slate-950">
              <Link href="/auctions/insights">Open insights</Link>
            </Button>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search artwork or seller"
              className="bg-white text-slate-950"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white text-slate-950">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-white text-slate-950">
                <SelectValue placeholder="Sort auctions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ending-soon">Ending soon</SelectItem>
                <SelectItem value="highest-price">Highest price</SelectItem>
                <SelectItem value="newest">Newest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

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
