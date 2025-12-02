import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { GetStaticProps } from 'next'
import Layout from '../components/Layout'

type Episode = { slug: string; title: string; description?: string; thumbnail?: string; date?: string }
type Props = { episodes: Episode[] }

export default function Home({ episodes }: Props) {
  return (
    <Layout episodes={episodes}>
      <h1>Hunjvo's Episodes</h1>
      <div className="episode-grid">
        {episodes.map((ep) => (
          <div key={ep.slug} className="episode-card">
            <a href={`/episodes/${ep.slug}`}>
              {ep.thumbnail && (
                <img src={ep.thumbnail} alt={ep.title} />
              )}
              <h2>{ep.title}</h2>
            </a>
            {ep.description && <p>{ep.description}</p>}
            {ep.date && <small>{ep.date}</small>}
          </div>
        ))}
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

