"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Bid {
  _id: string;
  amount: number;
  bidder: { username: string; email: string };
}

interface Auction {
  _id: string;
  artwork: { title: string; description: string };
  startPrice: number;
  currentPrice: number;
  endTime: string;
  status: string;
  winner?: { username: string; email: string };
  bids: Bid[];
}

export default function ArtistAuctions() {
  const [auctions, setAuctions] = useState<Auction[]>([]);

  useEffect(() => {
    fetch("https://auction-hyt6.onrender.com/api/auctions/my-auctions", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setAuctions(Array.isArray(data) ? data : []))
      .catch(() => setAuctions([]));
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center mb-6">🎨 My Auctions</h1>

      {auctions.length === 0 ? (
        <p className="text-center text-gray-500">No auctions created yet.</p>
      ) : (
        auctions.map((auction) => (
          <Card key={auction._id}>
            <CardHeader>
              <CardTitle>{auction.artwork?.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{auction.artwork?.description}</p>
              <p className="text-sm text-gray-500 mb-2">
                Starting Price: ${auction.startPrice}
              </p>
              <p className="mb-2">Current Price: ${auction.currentPrice}</p>
              <p className="mb-2">
                Status:{" "}
                {new Date() > new Date(auction.endTime)
                  ? "✅ Ended"
                  : "⏳ Active"}
              </p>
              {auction.winner && (
                <p className="mb-2">
                  🏆 Winner: {auction.winner.username} at 💰 $
                  {auction.currentPrice}
                </p>
              )}

              <h3 className="font-semibold mt-4 mb-2">Bids:</h3>
              {auction.bids.length === 0 ? (
                <p className="text-gray-500">No bids yet.</p>
              ) : (
                <ul className="space-y-1">
                  {auction.bids.map((bid) => (
                    <li key={bid._id} className="border-b py-1 text-sm">
                      {bid.bidder.username} bid ${bid.amount}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
