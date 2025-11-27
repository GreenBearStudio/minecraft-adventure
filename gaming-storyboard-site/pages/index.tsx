import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import Link from 'next/link'
import type { GetStaticProps } from 'next'

type Episode = {
  slug: string
  title: string
  description: string
  thumbnail: string
  date: string
}

type Props = {
  episodes: Episode[]
}

export default function Home({ episodes }: Props) {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Gaming Storyboard Episodes</h1>
      <div
        style={{
          display: 'grid',
          gap: '2rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        }}
      >
        {episodes.map((ep) => (
          <div
            key={ep.slug}
            style={{
              border: '1px solid #ccc',
              padding: '1rem',
              borderRadius: '8px',
            }}
          >
            <Link href={`/episodes/${ep.slug}`}>
              <img
                src={ep.thumbnail}
                alt={ep.title}
                style={{ width: '100%', borderRadius: '4px' }}
              />
              <h2>{ep.title}</h2>
            </Link>
            <p>{ep.description}</p>
            <small>{ep.date}</small>
          </div>
        ))}
      </div>
    </main>
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
    // sort newest first if date is provided
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  return { props: { episodes } }
}

