"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export default function HistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("https://auction-hyt6.onrender.com/api/payments/orders", {
          credentials: "include",
        });
        const data = await res.json();
        console.log("History API response:", data);
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <p className="text-center mt-20">Loading history...</p>;

  const paidOrders = orders.filter((o) => o.status === "completed");
  const unpaidOrders = orders.filter((o) => o.status === "unpaid");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto p-6 pt-20">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>

        {/* 🔴 Unpaid */}
        {unpaidOrders.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-red-600">
              ⚠️ Unpaid Auctions
            </h2>
            <ul className="space-y-3">
              {unpaidOrders.map((order) => (
                <li
                  key={order._id}
                  className="border rounded-lg p-3 bg-red-50 shadow"
                >
                  <p className="font-semibold">
                    Auction ID: {order.auction?._id}
                  </p>
                  <p className="text-sm text-gray-600">
                    Amount: ${order.amount}
                  </p>
                  <p className="text-sm text-red-600">Status: Unpaid</p>
                  <p className="text-xs text-gray-500">
                    Date: {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <Button
                    onClick={() => router.push(`/payment/${order.auction?._id}`)}
                    className="mt-3 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Pay Now
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 🟢 Paid */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-green-700">
            ✅ Completed Payments
          </h2>
          {paidOrders.length === 0 ? (
            <p className="text-gray-500">No completed orders yet.</p>
          ) : (
            <ul className="space-y-3">
              {paidOrders.map((order) => (
                <li key={order._id} className="border rounded-lg p-3 shadow">
                  <p className="font-semibold">
                    Auction ID: {order.auction?._id}
                  </p>
                  <p className="text-sm text-gray-600">
                    Amount: ${order.amount} — Method: {order.paymentMethod}
                  </p>
                  <p className="text-sm text-green-600">Status: Completed</p>
                  <p className="text-xs text-gray-500">
                    Date: {new Date(order.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
