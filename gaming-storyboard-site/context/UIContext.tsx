// context/UIContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react"

type UIContextType = {
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
  layout: "grid" | "list"
  setLayout: (layout: "grid" | "list") => void
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export function UIProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<"light" | "dark">("light")
  const [layout, setLayoutState] = useState<"grid" | "list">("grid")

  // Load saved preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const savedLayout = localStorage.getItem("layout") as "grid" | "list" | null
    if (savedTheme) setThemeState(savedTheme)
    if (savedLayout) setLayoutState(savedLayout)
  }, [])

  // Persist changes
  useEffect(() => {
    localStorage.setItem("theme", theme)
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem("layout", layout)
  }, [layout])

  const setTheme = (t: "light" | "dark") => setThemeState(t)
  const setLayout = (l: "grid" | "list") => setLayoutState(l)

  return (
    <UIContext.Provider value={{ theme, setTheme, layout, setLayout }}>
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error("useUI must be used within UIProvider")
  return ctx
}

