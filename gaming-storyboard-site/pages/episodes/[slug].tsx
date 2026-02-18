// pages/episodes/[slug].tsx
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { GetStaticPaths, GetStaticProps } from "next";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import Layout from "../../components/Layout";
import SideStoryLink from "../../components/SideStoryLink";
import type { SideStory } from "../../components/SideStoryLink";

type EpisodeMeta = { slug: string; title: string };
type Frontmatter = { title: string; description: string; thumbnail: string };

type Props = {
  source: MDXRemoteSerializeResult;
  frontmatter: Frontmatter;
  episodes: EpisodeMeta[];
  sideEpisodes: SideStory[]; 
};

export default function EpisodePage({
  source,
  frontmatter,
  episodes,
  sideEpisodes,
}: Props) {
  return (
    <Layout episodes={episodes}>
      <h1>{frontmatter.title}</h1>
      <p>{frontmatter.description}</p>

      <MDXRemote
      {...source}
      components={{
        SideStoryLink: ({ slug }) => {
          // Defensive check #1 — missing slug
          if (!slug) {
            return (
              <p style={{ color: "red" }}>
                Invalid &lt;SideStoryLink&gt;: missing slug
              </p>
            );
          }

          // Defensive check #2 — slug not found
          const story = sideEpisodes.find((s) => s.slug === slug);
          if (!story) {
            return (
              <p style={{ color: "red" }}>
                Missing side story: {slug}
              </p>
            );
          }

          // Safe to render
          return <SideStoryLink story={story} />;
        },
      }}
    />
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const episodesDir = path.join(process.cwd(), "content", "episodes");
  const files = fs.readdirSync(episodesDir);

  const paths = files.map((file) => ({
    params: { slug: file.replace(/\.mdx$/, "") },
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string;

  // MAIN EPISODE
  const episodesDir = path.join(process.cwd(), "content", "episodes");
  const fullPath = path.join(episodesDir, `${slug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { content, data } = matter(fileContents);
  const mdxSource = await serialize(content);

  // MAIN EPISODE LIST (for navigation)
  const files = fs.readdirSync(episodesDir);
  const episodes: EpisodeMeta[] = files.map((file) => {
    const s = file.replace(/\.mdx$/, "");
    const f = fs.readFileSync(path.join(episodesDir, file), "utf8");
    const { data } = matter(f);
    return { slug: s, title: data.title || s };
  });

  // ⭐ SAFE SIDE EPISODE LOADING
  let sideEpisodes: SideStory[] = [];

  try {
    const sideDir = path.join(process.cwd(), "content", "side-episodes");

    if (fs.existsSync(sideDir)) {
      const sideFiles = fs.readdirSync(sideDir);

      sideEpisodes = await Promise.all(
        sideFiles
          .filter((f) => f.endsWith(".mdx"))
          .map(async (file) => {
            const sideSlug = file.replace(/\.mdx$/, "");
            const fullSidePath = path.join(sideDir, file);
            const sideContents = fs.readFileSync(fullSidePath, "utf8");
            const { content: sideContent, data: sideData } =
              matter(sideContents);
            const sideMdx = await serialize(sideContent);

            return {
              slug: sideSlug,
              title: sideData.title || sideSlug,
              description: sideData.description || "",
              thumbnail: sideData.thumbnail || "/images/default.png",
              content: sideMdx,
            };
          })
      );
    }
  } catch (err) {
    console.error("Error loading side episodes:", err);
    sideEpisodes = [];
  }

  return {
    props: {
      source: mdxSource,
      frontmatter: {
        title: data.title || slug,
        description: data.description || "",
        thumbnail: data.thumbnail || "/images/default.png",
      },
      episodes,
      sideEpisodes, 
    },
  };
};

