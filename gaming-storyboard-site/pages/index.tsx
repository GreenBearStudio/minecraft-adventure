//pages/index.tsx
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { GetStaticProps } from 'next'
import Layout from '../components/Layout'
import { useUI } from '../context/UIContext'
import { useState, useEffect } from 'react'

type Episode = {
  slug: string
  title: string
  description?: string
  thumbnail?: string
  date?: string
}

type Props = { episodes: Episode[] }

export default function Home({ episodes }: Props) {
  const { layout, setLayout } = useUI()
  const [watched, setWatched] = useState<string[]>([])
  const [hasLoaded, setHasLoaded] = useState(false)

  // Load watched episodes from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('watchedEpisodes')
      if (saved) {
        try {
          setWatched(JSON.parse(saved))
        } catch (err) {
          console.error("Error parsing watchedEpisodes:", err)
        }
      }
      setHasLoaded(true)
    }
  }, [])

  // Save watched episodes only after load
  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem('watchedEpisodes', JSON.stringify(watched))
    }
  }, [watched, hasLoaded])

  const markWatched = (slug: string) => {
    if (!watched.includes(slug)) {
      setWatched([...watched, slug])
    }
  }
  
  // Progress Bar
  const totalEpisodes = episodes.length;
  const watchedCount = watched.length;
  const progress = totalEpisodes > 0 ? (watchedCount / totalEpisodes) * 100 : 0;

  return (
    <Layout episodes={episodes}>
      <h1>Hunjvo&apos;s Episodes</h1>
      
      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-label">
          Progress: {watchedCount} / {totalEpisodes}
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Episodes */}
      <div className={layout === 'grid' ? 'episode-grid' : 'episode-list'}>
        {episodes.map((ep, i) => {
          const isOldest = i === episodes.length - 1;
          const nextSlug = episodes[i + 1]?.slug; // the episode AFTER this one
          const { unlockAll } = useUI()
          
          const unlocked = unlockAll || isOldest || watched.includes(nextSlug)
          
          if (!unlocked) return null; // hide locked episodes

          return (
            <div
              key={ep.slug}
              className={`episode-card ${watched.includes(ep.slug) ? 'watched' : ''}`}
              onClick={() => markWatched(ep.slug)}
            >
              <div className="episode-card-content">
                <a href={`/episodes/${ep.slug}`}>
                  {ep.thumbnail && <img src={ep.thumbnail} alt={ep.title} />}
                  <h2>{ep.title}</h2>
                </a>
                {ep.description && <p>{ep.description}</p>}
                {ep.date && <small>{ep.date}</small>}
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const episodesDir = path.join(process.cwd(), 'content', 'episodes')
  const files = fs.readdirSync(episodesDir)

  const episodes: Episode[] = files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '')
      const fullPath = path.join(episodesDir, file)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(fileContents)
      return {
        slug,
        title: data.title || slug,
        description: data.description || '',
        thumbnail: data.thumbnail || '/images/default.png',
        date: data.date || '',
      }
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  return { props: { episodes } }
}

