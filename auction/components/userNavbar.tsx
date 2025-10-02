"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export default function Navbar({ onLogout }: { onLogout?: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-gray-900 text-white w-full fixed top-0 left-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <Link href="/" className="text-2xl font-bold tracking-wide">
            🎨 ArtAuction
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/profile" className="hover:text-gray-300">
              Profile
            </Link>
            <Link href="/auctions" className="hover:text-gray-300">
              Auctions
            </Link>
            <Link href="/history" className="hover:text-gray-300">
              History
            </Link>
            {onLogout && (
              <Button
                onClick={() => onLogout?.()}
                className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2"
              >
                Logout
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-800 px-4 pt-2 pb-4 space-y-3">
          <Link href="/profile" className="block hover:text-gray-300">
            Profile
          </Link>
          <Link href="/auctions" className="block hover:text-gray-300">
            Auctions
          </Link>
          <Link href="/history" className="block hover:text-gray-300">
            History
          </Link>
          {onLogout && (
            <Button
              onClick={() => {
                setMenuOpen(false)
                onLogout?.()
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2"
            >
              Logout
            </Button>
          )}
        </div>
      )}
    </nav>
  )
}
