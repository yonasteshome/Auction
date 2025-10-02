"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../../components/Navbar" // ✅ import your reusable Navbar
import { Card, CardContent } from "@/components/ui/card"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
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
    await fetch("https://auction-hyt6.onrender.com/api/users/logout", {
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
      {/* ✅ Use central Navbar */}
      <Navbar onLogout={handleLogout} />

      {/* 🔹 Main content */}
      <main className="flex-1 p-6 flex flex-col md:flex-row gap-6 mt-16">
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
