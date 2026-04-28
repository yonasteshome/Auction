"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import * as React from "react"

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
      disableTransitionOnChange={disableTransitionOnChange}
      attribute={attribute}
    >
      {children}
    </NextThemesProvider>
  )
}
