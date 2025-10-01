"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" })
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("https://auction-xi-five.vercel.app/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      })
      if (!res.ok) throw new Error("Login failed")
      router.push("/profile")
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 rounded-2xl shadow-lg overflow-hidden bg-white">
        {/* Left side - Image */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
          <img
            src="/auction-login.jpg"
            alt="Auction Illustration"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        {/* Right side - Form */}
        <div className="flex items-center justify-center p-6">
          <Card className="w-full max-w-sm border-none shadow-none">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Welcome Back
              </CardTitle>
              <p className="text-sm text-gray-500">Login to continue bidding</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  onChange={handleChange}
                  className="py-5 rounded-xl"
                  required
                />
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  className="py-5 rounded-xl"
                  required
                />
                <Button
                  type="submit"
                  className="w-full py-6 text-base rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Login
                </Button>
              </form>
              <p className="text-sm text-center mt-4 text-gray-600">
                Don’t have an account?{" "}
                <Link href="/signup" className="text-blue-600 font-medium">
                  Sign Up
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
