import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { GetStaticProps } from 'next'
import Layout from '../components/Layout'

type Episode = { slug: string; title: string }

type Props = { episodes: Episode[] }

export default function About({ episodes }: Props) {
  return (
    <Layout episodes={episodes}>
      <h1>About This Project</h1>
      <p>
        This site is a modular publishing pipeline for gaming storyboards. Each episode is written
        in MDX with frontmatter metadata, making it easy to version, extend, and diagnose.
      </p>
      <p>
        The goal is to explore narrative design, gameplay mechanics, and creative flows in a
        reproducible format. By combining Next.js, MDX, and reusable components, we can embed
        images, videos, and interactive flows directly into each episode.
      </p>
      <p>
        Built with extensibility in mind, the pipeline ensures that new episodes can be added simply
        by dropping a file into <code>content/episodes/</code>. The homepage and navigation update
        automatically, keeping the site future‑proof and easy to maintain.
      </p>
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
      return { slug, title: data.title || slug }
    })

  return { props: { episodes } }
}

