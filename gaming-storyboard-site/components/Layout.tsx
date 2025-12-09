import Link from 'next/link'
import { useRouter } from 'next/router'
import { useUI } from '../context/UIContext'   // <-- unified context

type Episode = { slug: string; title: string }
type Props = { children: React.ReactNode; episodes: Episode[] }

export default function Layout({ children, episodes }: Props) {
  const router = useRouter()
  const { theme, setTheme } = useUI()   // <-- from UIContext

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const slug = e.target.value
    if (slug) router.push(`/episodes/${slug}`)
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <div className="layout">
      <header className="layout-header">
        <nav className="layout-nav">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/settings">Settings</Link>   {/* 👈 new link */}
          <div style={{ marginLeft: 'auto' }}>
            <label htmlFor="episode-select">Episodes:</label>
            <select id="episode-select" onChange={handleChange} defaultValue="">
              <option value="" disabled>Select an episode</option>
              {episodes.map(ep => (
                <option key={ep.slug} value={ep.slug}>{ep.title}</option>
              ))}
            </select>
          </div>
        </nav>
      </header>
      <main className="layout-main">{children}</main>
      <footer className="layout-footer">© 2025 Hunjvo's Minecraft Storyboard Project</footer>
    </div>
  )
}

