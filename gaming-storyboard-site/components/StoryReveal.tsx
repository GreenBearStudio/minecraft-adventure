import { useRef, useEffect } from "react";
import { MDXProvider } from "@mdx-js/react";
import { useStoryState } from "../context/StoryStateContext";
import components from "../mdx-components";

type StoryRevealProps = {
  flag: string;
  children: React.ReactNode;
};

export default function StoryReveal({ flag, children }: StoryRevealProps) {
  const { flags } = useStoryState();
  const isVisible = !!flags[flag];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div ref={ref} className="story-reveal">
      <MDXProvider components={components}>
        {children}
      </MDXProvider>
    </div>
  );
}

