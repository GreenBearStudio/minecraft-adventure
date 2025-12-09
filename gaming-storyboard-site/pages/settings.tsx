import Layout from '../components/Layout'
import { useUI } from '../context/UIContext'
import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'   // 👈 new toast context

export default function Settings() {
  const { theme, setTheme, layout, setLayout } = useUI()
  const [watched, setWatched] = useState<string[]>([])
  const { showToast } = useToast()

  useEffect(() => {
    const saved = localStorage.getItem('watchedEpisodes')
    if (saved) setWatched(JSON.parse(saved))
  }, [])

  const clearWatched = () => {
    if (window.confirm("Are you sure you want to clear all watched episodes?")) {
      setWatched([])
      localStorage.removeItem('watchedEpisodes')
      showToast("Watched episodes cleared ✅")   // 👈 trigger toast
    }
  }

  return (
    <Layout episodes={[]}>
      <h1>Settings</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button className="button button-primary" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
        <button className="button button-secondary" onClick={() => setLayout(layout === 'grid' ? 'list' : 'grid')}>
          {layout === 'grid' ? '📋 List View' : '🔲 Grid View'}
        </button>
        <button className="button button-danger" onClick={clearWatched}>
          🗑 Clear Watched Episodes
        </button>
      </div>
    </Layout>
  )
}

