"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function HistoryPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("https://auction-hyt6.onrender.com/api/payments/me", {
          credentials: "include",
        })
        const data = await res.json()
        console.log("History API response:", data)
        setOrders(data) // ✅ since API returns an array
      } catch (err) {
        console.error("Failed to load history:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  if (loading) return <p className="text-center mt-20">Loading history...</p>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order._id} className="border rounded-lg p-3">
              <p className="font-semibold">Auction ID: {order.auction?._id}</p>
              <p className="text-sm text-gray-600">
                Amount: ${order.amount} — Method: {order.paymentMethod}
              </p>
              <p className="text-sm">
                Status:{" "}
                <span className={order.status === "completed" ? "text-green-600" : "text-red-600"}>
                  {order.status}
                </span>
              </p>
              <p className="text-xs text-gray-500">Date: {new Date(order.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
