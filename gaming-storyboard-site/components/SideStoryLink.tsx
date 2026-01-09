import { useState } from "react";
import { MDXRemote } from "next-mdx-remote";

export default function SideStoryLink({ story }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="side-story-block">

      {/* Button with embedded preview */}
      <button
        className="side-story-link"
        onClick={() => setOpen(!open)}
      >
        <div className="side-story-button-content">
          {/* Small icon thumbnail */}
          {story.thumbnail && (
            <img
              src={story.thumbnail}
              alt={story.title}
              className="side-story-icon"
            />
          )}

          <div className="side-story-button-text">
            <span className="side-story-title">{story.title}</span>

            {/* Inline preview (description only) */}
            {story.description && (
              <p className="side-story-button-preview">
                {story.description}
              </p>
            )}
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="side-story-content">
          <MDXRemote {...story.content} />
        </div>
      )}
    </div>
  );
}

