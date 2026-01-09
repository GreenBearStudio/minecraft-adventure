import { useState } from "react";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";

// Define the shape of a side story
export type SideStory = {
  slug: string;
  title: string;
  description?: string;
  thumbnail?: string;
  content: MDXRemoteSerializeResult;
};

export default function SideStoryLink({ story }: { story: SideStory }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="side-story-block">
      <button
        className="side-story-link"
        onClick={() => setOpen(!open)}
      >
        <div className="side-story-button-content">
          {story.thumbnail && (
            <img
              src={story.thumbnail}
              alt={story.title}
              className="side-story-icon"
            />
          )}

          <div className="side-story-button-text">
            <span className="side-story-title">{story.title}</span>

            {story.description && (
              <p className="side-story-button-preview">
                {story.description}
              </p>
            )}
          </div>
        </div>
      </button>

      {open && (
        <div className="side-story-content">
          <MDXRemote {...story.content} />
        </div>
      )}
    </div>
  );
}

