"use client"

import { Button } from "@repo/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card"
import Link from "next/link"
import { useEffect, useState } from "react"
import Navbar from "../../../components/userNavbar"

type InsightPayload = {
  totals: {
    auctions: number
    active: number
    upcoming: number
    ended: number
    bids: number
  }
  pricing: {
    averageStartingPrice: number
    averageCurrentPrice: number
  }
  closingSoon: Array<{
    id: string
    title: string
    currentPrice: number
    endTime: string
  }>
  topAuction: null | {
    id: string
    title: string
    currentPrice: number
    endTime: string
  }
}

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0)

export default function AuctionInsightsPage() {
  const [insights, setInsights] = useState<InsightPayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await fetch("https://auction-hyt6.onrender.com/api/auctions/insights")
        const data = await res.json()
        setInsights(data)
      } catch (error) {
        console.error("❌ Fetch auction insights error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="pt-24 px-4 pb-12 max-w-6xl mx-auto space-y-8">
        <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900 text-white p-8 shadow-xl">
          <p className="text-sm uppercase tracking-[0.35em] text-blue-200">Auction Intelligence</p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl md:text-5xl font-black leading-tight">A bigger auction experience</h1>
              <p className="mt-3 max-w-2xl text-slate-200">
                Track live market activity, see what is closing soon, and surface the most valuable lots
                without leaving the auction flow.
              </p>
            </div>
            <Button asChild className="bg-white text-slate-950 hover:bg-slate-100">
              <Link href="/auctions">Back to auctions</Link>
            </Button>
          </div>
        </section>

        {loading ? (
          <p className="text-center text-slate-600">Loading auction insights...</p>
        ) : insights ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {[
                ["Total auctions", insights.totals.auctions],
                ["Active", insights.totals.active],
                ["Upcoming", insights.totals.upcoming],
                ["Ended", insights.totals.ended],
                ["Bids placed", insights.totals.bids],
              ].map(([label, value]) => (
                <Card key={String(label)} className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">{label}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-3xl font-black text-slate-950">{String(value)}</CardContent>
                </Card>
              ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Pricing overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-slate-700">
                  <p className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span>Average starting price</span>
                    <strong>{money(insights.pricing.averageStartingPrice)}</strong>
                  </p>
                  <p className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span>Average current price</span>
                    <strong>{money(insights.pricing.averageCurrentPrice)}</strong>
                  </p>
                  <p className="text-sm text-slate-500">
                    Focused on live bidding, pricing trends, and fast auction decision-making.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Top auction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-slate-700">
                  {insights.topAuction ? (
                    <>
                      <p className="text-xl font-bold text-slate-950">{insights.topAuction.title}</p>
                      <p>Current price: {money(insights.topAuction.currentPrice)}</p>
                      <p>
                        Ends: {new Date(insights.topAuction.endTime).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </>
                  ) : (
                    <p>No active auction has reached a top price yet.</p>
                  )}
                </CardContent>
              </Card>
            </section>

            <section>
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Closing soon</CardTitle>
                </CardHeader>
                <CardContent>
                  {insights.closingSoon.length ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {insights.closingSoon.map((auction) => (
                        <div key={auction.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="font-semibold text-slate-950">{auction.title}</p>
                          <p className="mt-2 text-sm text-slate-600">Current price: {money(auction.currentPrice)}</p>
                          <p className="text-sm text-slate-600">
                            Ends: {new Date(auction.endTime).toLocaleString("en-US", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-600">No active auctions are closing within the next 24 hours.</p>
                  )}
                </CardContent>
              </Card>
            </section>
          </>
        ) : (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-8 text-center text-slate-600">
              <p>Insights could not be loaded.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}