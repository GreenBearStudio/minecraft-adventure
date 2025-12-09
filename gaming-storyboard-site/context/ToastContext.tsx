// context/ToastContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react'

type ToastContextType = {
  message: string | null
  showToast: (msg: string) => void
}

const ToastContext = createContext<ToastContextType>({
  message: null,
  showToast: () => {},
})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(null), 3000) // auto-hide after 3s
  }

  return (
    <ToastContext.Provider value={{ message, showToast }}>
      {children}
      {message && <div className="toast">{message}</div>}
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

