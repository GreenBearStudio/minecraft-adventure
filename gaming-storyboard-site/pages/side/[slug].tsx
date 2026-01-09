// pages/side/[slug].tsx
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { GetStaticPaths, GetStaticProps } from 'next'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import Layout from '../../components/Layout'

type SideMeta = { slug: string; title: string }
type Frontmatter = { title: string; description: string; thumbnail: string }
type Props = { source: MDXRemoteSerializeResult; frontmatter: Frontmatter; sides: SideMeta[] }

export default function SideEpisodePage({ source, frontmatter, sides }: Props) {
  return (
    <Layout episodes={sides}>
      <h1>{frontmatter.title}</h1>
      <p>{frontmatter.description}</p>
      <MDXRemote {...source} />
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const sideDir = path.join(process.cwd(), 'content', 'side-episodes')
  const files = fs.readdirSync(sideDir)

  const paths = files.map((file) => ({
    params: { slug: file.replace(/\.mdx$/, '') },
  }))

  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string
  const sideDir = path.join(process.cwd(), 'content', 'side-episodes')
  const fullPath = path.join(sideDir, `${slug}.mdx`)

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { content, data } = matter(fileContents)
  const mdxSource = await serialize(content)

  // discover all side episodes for navigation
  const files = fs.readdirSync(sideDir)
  const sides: SideMeta[] = files.map((file) => {
    const s = file.replace(/\.mdx$/, '')
    const f = fs.readFileSync(path.join(sideDir, file), 'utf8')
    const { data } = matter(f)
    return { slug: s, title: data.title || s }
  })

  return {
    props: {
      source: mdxSource,
      frontmatter: {
        title: data.title || slug,
        description: data.description || '',
        thumbnail: data.thumbnail || '/images/default.png',
      },
      sides,
    },
  }
}

