"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export default function HistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all");
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("https://auction-hyt6.onrender.com/api/payments/me", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <p className="p-6 text-center">Loading orders...</p>;

  const completed = orders.filter((o) => o.status === "completed");
  const unpaid = orders.filter((o) => o.status !== "completed");

  let visibleOrders = orders;
  if (filter === "paid") visibleOrders = completed;
  if (filter === "unpaid") visibleOrders = unpaid;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto p-6 pt-20">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>

        {/* 🔹 Filter buttons */}
        <div className="flex gap-3 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "paid" ? "default" : "outline"}
            onClick={() => setFilter("paid")}
          >
            ✅ Paid
          </Button>
          <Button
            variant={filter === "unpaid" ? "default" : "outline"}
            onClick={() => setFilter("unpaid")}
          >
            ❌ Unpaid
          </Button>
        </div>

        {/* 🔹 Orders list */}
        {visibleOrders.length > 0 ? (
          visibleOrders.map((order) => (
            <div
              key={order._id}
              className={`border rounded-lg p-4 mb-4 shadow-sm ${
                order.status === "completed" ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <p className="font-semibold">
                Auction ID: <span className="text-blue-600">{order.auction?._id}</span>
              </p>
              <p>Amount: ${order.amount}</p>
              <p>
                Status:{" "}
                <span
                  className={
                    order.status === "completed"
                      ? "text-green-600 font-medium"
                      : "text-red-600 font-medium"
                  }
                >
                  {order.status}
                </span>
              </p>
              <p className="text-xs text-gray-500">
                Date: {new Date(order.createdAt).toLocaleString()}
              </p>

              {/* Show Pay button for unpaid */}
              {order.status !== "completed" && (
                <Button
                  className="mt-3 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => router.push(`/payment/${order.auction?._id}`)}
                >
                  Pay Now
                </Button>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">
            {filter === "paid"
              ? "No completed orders yet."
              : filter === "unpaid"
              ? "No unpaid orders 🎉"
              : "No orders found."}
          </p>
        )}
      </main>
    </div>
  );
}
