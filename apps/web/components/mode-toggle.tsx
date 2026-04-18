"use client"

import { Button } from "@repo/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import * as React from "react"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Ensure this runs only on client
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Avoid rendering mismatched icons on server
    return (
      <Button variant="outline" size="icon" disabled>
        <Sun className="h-5 w-5 opacity-0" />
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  )
}
