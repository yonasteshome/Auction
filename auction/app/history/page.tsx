"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";   // ✅ Import your Navbar component

export default function HistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(
          "https://auction-hyt6.onrender.com/api/payments/me",
          {
            method: "GET",
            credentials: "include",
          }
        );
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

  if (loading) return <p className="p-6">Loading orders...</p>;

  const completed = orders.filter((o) => o.status === "completed");
  const unpaid = orders.filter((o) => o.status !== "completed");

  return (
    <div>
      {/* ✅ Navbar at the top */}
      <Navbar />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">My Orders</h1>

        {/* ✅ Completed Orders */}
        <h2 className="text-green-600 font-semibold mb-2">
          ✅ Completed Payments
        </h2>
        {completed.length > 0 ? (
          completed.map((order) => (
            <div
              key={order._id}
              className="border rounded p-4 mb-3 bg-white shadow"
            >
              <p>
                <strong>Auction ID:</strong> {order.auction?._id}
              </p>
              <p>
                <strong>Amount:</strong> ${order.amount} —{" "}
                <strong>Method:</strong> {order.paymentMethod}
              </p>
              <p>
                <strong>Status:</strong> {order.status}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 mb-6">No completed orders yet.</p>
        )}

        {/* ❌ Unpaid Orders */}
        <h2 className="text-red-600 font-semibold mb-2 mt-6">
          ❌ Unpaid Orders
        </h2>
        {unpaid.length > 0 ? (
          unpaid.map((order) => (
            <div
              key={order._id}
              className="border rounded p-4 mb-3 bg-white shadow"
            >
              <p>
                <strong>Auction ID:</strong> {order.auction?._id}
              </p>
              <p>
                <strong>Amount:</strong> ${order.amount}
              </p>
              <p>
                <strong>Status:</strong> {order.status}
              </p>
              <Button
                className="mt-2"
                onClick={() => router.push(`/payment/${order.auction?._id}`)}
              >
                Pay Now
              </Button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No unpaid orders 🎉</p>
        )}
      </div>
    </div>
  );
}
