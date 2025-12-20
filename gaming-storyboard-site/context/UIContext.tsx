// context/UIContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react"

type UIContextType = {
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
  layout: "grid" | "list"
  setLayout: (layout: "grid" | "list") => void
  unlockAll: boolean 
  setUnlockAll: (v: boolean) => void
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export function UIProvider({ children }: { children: ReactNode }) {
  // Different states
  const [theme, setThemeState] = useState<"light" | "dark">("light")
  const [layout, setLayoutState] = useState<"grid" | "list">("grid")
  const [unlockAll, setUnlockAllState] = useState<boolean>(false)

  // Load saved preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const savedLayout = localStorage.getItem("layout") as "grid" | "list" | null
    if (savedTheme) setThemeState(savedTheme)
    if (savedLayout) setLayoutState(savedLayout)
  }, [])
  
  useEffect(() => {
    const stored = localStorage.getItem("unlockAll");
    if (stored !== null) {
      setUnlockAll(JSON.parse(stored));
    }
  }, []);

  // Persist changes
  useEffect(() => {
    localStorage.setItem("theme", theme)
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem("layout", layout)
  }, [layout])
  
  useEffect(() => { 
    localStorage.setItem("unlockAll", unlockAll ? "true" : "false") 
  }, [unlockAll])

  // Setters
  const setTheme = (t: "light" | "dark") => setThemeState(t)
  const setLayout = (l: "grid" | "list") => setLayoutState(l)
  const setUnlockAll = (v: boolean) => setUnlockAllState(v)

  return (
    <UIContext.Provider 
      value={{ 
        theme, 
        setTheme, 
        layout, 
        setLayout,
        unlockAll,
        setUnlockAll, 
      }}
    >
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error("useUI must be used within UIProvider")
  return ctx
}

/*
frontmatter field like requires: previous-episode-slug
*/
