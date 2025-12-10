// pages/settings.tsx
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { GetStaticProps } from 'next'
import Layout from '../components/Layout'
import { useUI } from '../context/UIContext'
import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'

type Episode = { slug: string; title: string }

export default function Settings({ episodes }: { episodes: Episode[] }) {
  const { theme, setTheme, layout, setLayout } = useUI()
  const { showToast } = useToast()
  const [watched, setWatched] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('watchedEpisodes')
    if (saved) setWatched(JSON.parse(saved))
  }, [])

  const clearWatched = () => {
    if (window.confirm("Are you sure you want to clear all watched episodes?")) {
      setWatched([])
      localStorage.removeItem('watchedEpisodes')
      showToast("Watched episodes cleared ✅")
    }
  }

  return (
    <Layout episodes={episodes}>
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

export const getStaticProps: GetStaticProps = async () => {
  const episodesDir = path.join(process.cwd(), 'content', 'episodes')
  const files = fs.readdirSync(episodesDir)

  const episodes = files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '')
      const fullPath = path.join(episodesDir, file)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(fileContents)
      return { slug, title: data.title || slug }
    })

  return { props: { episodes } }
}

