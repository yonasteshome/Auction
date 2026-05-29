"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

export default function CreateArtworkPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("https://auction-hyt6.onrender.com/api/users/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("https://auction-hyt6.onrender.com/api/artworks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ send cookies
        body: JSON.stringify({
          title,
          description,
          category,
          imageUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create artwork");
      }

      router.push("/artist/dashboard"); // redirect after success
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* 🔹 Navbar */}
      <Navbar onLogout={handleLogout} />

      {/* 🔹 Form */}
      <main className="flex flex-1 justify-center items-center p-4">
        <Card className="w-full max-w-lg shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Upload Artwork
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Artwork Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Textarea
                placeholder="Artwork Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <Input
                placeholder="Category (e.g., Painting, Sculpture)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
              <Input
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
              >
                Create Artwork
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
