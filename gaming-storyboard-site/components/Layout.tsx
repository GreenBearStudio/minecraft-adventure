import Link from 'next/link'
import { useRouter } from 'next/router'

type Episode = { slug: string; title: string }

type Props = {
  children: React.ReactNode
  episodes: Episode[]
}

export default function Layout({ children, episodes }: Props) {
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const slug = e.target.value
    if (slug) {
      router.push(`/episodes/${slug}`)
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <header style={{ padding: '1rem', background: '#222', color: '#fff' }}>
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>

          {/* Dropdown for episodes */}
          <div style={{ marginLeft: 'auto' }}>
            <label htmlFor="episode-select" style={{ marginRight: '0.5rem' }}>
              Episodes:
            </label>
            <select
              id="episode-select"
              onChange={handleChange}
              defaultValue=""
              style={{ padding: '0.3rem', borderRadius: '4px' }}
            >
              <option value="" disabled>
                Select an episode
              </option>
              {episodes.map((ep) => (
                <option key={ep.slug} value={ep.slug}>
                  {ep.title}
                </option>
              ))}
            </select>
          </div>
        </nav>
      </header>

      <main style={{ padding: '2rem' }}>{children}</main>

      <footer style={{ padding: '1rem', background: '#eee', marginTop: '2rem' }}>
        <p>© 2025 Hunjvo's Minecraft Storyboard Project</p>
      </footer>
    </div>
  )
}

