//pages/about.tsx
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { GetStaticProps } from "next";
import Layout from "../components/Layout";
import { useState } from "react";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import { z } from "zod";

type Episode = { slug: string; title: string };
type AboutTopic = { slug: string; title: string; content: MDXRemoteSerializeResult };
type Props = { episodes: Episode[]; topics: AboutTopic[] };

// Define schema for frontmatter
const AboutFrontmatterSchema = z.object({
  title: z.string().min(1, "title is required"),
});

function Accordion({ topics }: { topics: AboutTopic[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="accordion">
      {topics.map((topic, i) => (
        <div key={topic.slug} className="accordion-item">
          <button
            className="button button-accordion"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            {topic.title}
          </button>
          {openIndex === i && (
            <div className="accordion-content">
              <MDXRemote {...topic.content} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function About({ episodes, topics }: Props) {
  return (
    <Layout episodes={episodes}>
      <h1>About</h1>
      <Accordion topics={topics} />
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  // Episodes
  const episodesDir = path.join(process.cwd(), "content", "episodes");
  const files = fs.readdirSync(episodesDir);
  const episodes: Episode[] = files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const fullPath = path.join(episodesDir, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);
      return { slug, title: data.title || slug };
    });

  // About topics
  const aboutDir = path.join(process.cwd(), "content", "about");
  const aboutFiles = fs.readdirSync(aboutDir);
  const topics: AboutTopic[] = await Promise.all(
    aboutFiles.filter((f) => f.endsWith(".mdx")).map(async (file) => {
      const slug = file.replace(/\.mdx$/, "");
      const fullPath = path.join(aboutDir, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { content, data } = matter(fileContents);

      // Validate frontmatter against schema
      const parsed = AboutFrontmatterSchema.safeParse(data);
      if (!parsed.success) {
          throw new Error(
            `Invalid frontmatter in ${file}: ${parsed.error.issues
              .map((issue) => issue.message)
              .join(", ")}`
          );
        }

      const mdxSource = await serialize(content);
      return { slug, title: parsed.data.title, content: mdxSource };
    })
  );

  return { props: { episodes, topics } };
};

