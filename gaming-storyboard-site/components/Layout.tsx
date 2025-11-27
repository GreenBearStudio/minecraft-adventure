import Link from 'next/link'

type Episode = { slug: string; title: string }

type Props = {
  children: React.ReactNode
  episodes: Episode[]
}

export default function Layout({ children, episodes }: Props) {
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <header style={{ padding: '1rem', background: '#222', color: '#fff' }}>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{ marginRight: '0.5rem' }}>Episodes:</span>
            {episodes.map((ep) => (
              <Link key={ep.slug} href={`/episodes/${ep.slug}`}>
                {ep.title}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main style={{ padding: '2rem' }}>{children}</main>
      <footer style={{ padding: '1rem', background: '#eee', marginTop: '2rem' }}>
        <p>© 2025 Gaming Storyboard Project</p>
      </footer>
    </div>
  )
}

