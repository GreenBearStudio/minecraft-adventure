import Link from 'next/link'

export default function Home() {
  const episodes = [
    { slug: 'episode-01', title: 'Episode 01 – Boss Phase Transitions' },
    { slug: 'episode-02', title: 'Episode 02 – Resource Management' },
    // Add more episodes here
  ]

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Gaming Storyboard Episodes</h1>
      <ul>
        {episodes.map(ep => (
          <li key={ep.slug}>
            <Link href={`/episodes/${ep.slug}`}>{ep.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

