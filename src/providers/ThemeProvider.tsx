"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
                                  children,
                                  ...props
                              }: React.ComponentProps<typeof NextThemesProvider>) {
    // Force light mode on mount by clearing any stored dark theme
    React.useEffect(() => {
        // Only run once on mount
        const storedTheme = localStorage.getItem('yesca-theme')
        if (!storedTheme || storedTheme === 'dark') {
            localStorage.setItem('yesca-theme', 'light')
            // Force remove dark class from html element
            document.documentElement.classList.remove('dark')
        }
    }, [])

    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}