import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { GetStaticPaths, GetStaticProps } from 'next'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'

// Import your custom components
import ImageGallery from '../../components/ImageGallery'
import VideoEmbed from '../../components/VideoEmbed'
import StoryFlowEmbed from '../../components/StoryFlowEmbed'

type Frontmatter = {
  title: string
  description: string
  thumbnail: string
  date?: string
}

type Props = {
  source: MDXRemoteSerializeResult
  frontmatter: Frontmatter
}

export default function EpisodePage({ source, frontmatter }: Props) {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>{frontmatter.title}</h1>
      <p>{frontmatter.description}</p>
      {frontmatter.thumbnail && (
        <img
          src={frontmatter.thumbnail}
          alt={frontmatter.title}
          width="400"
          style={{ borderRadius: '8px' }}
        />
      )}
      {/* Pass components here */}
      <MDXRemote {...source} components={{ ImageGallery, VideoEmbed, StoryFlowEmbed }} />
    </main>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const episodesDir = path.join(process.cwd(), 'content', 'episodes')
  const files = fs.readdirSync(episodesDir)

  const paths = files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => ({
      params: { slug: file.replace(/\.mdx$/, '') },
    }))

  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string
  const fullPath = path.join(process.cwd(), 'content', 'episodes', `${slug}.mdx`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  const { content, data } = matter(fileContents)
  const mdxSource = await serialize(content)

  return {
    props: {
      source: mdxSource,
      frontmatter: {
        title: data.title || slug,
        description: data.description || '',
        thumbnail: data.thumbnail || '/images/default.png',
        date: data.date || '',
      },
    },
  }
}

