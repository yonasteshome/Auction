"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

interface Props {
  children: React.ReactNode
  attribute?: "class" | "data-theme"
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = true,
}: Props) {
  return (
    <NextThemesProvider
      
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
