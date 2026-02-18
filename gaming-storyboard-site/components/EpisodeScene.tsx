import ChoiceBlock from "../components/ChoiceBlock";
import Choice from "../components/Choice";
import StoryboardMedia, { MediaItem } from "../components/StoryboardMedia";

type Props = {
  title: string;
  prompt: string;
  choices: { label: string; content: React.ReactNode; setFlag?: string }[];
  media: MediaItem[];
};

export default function EpisodeScene({ title, prompt, choices, media }: Props) {
  return (
    <section className="episode-scene">
      <h2>{title}</h2>

      {/* Media block */}
      <StoryboardMedia items={media} />

      {/* Choice block */}
      <ChoiceBlock prompt={prompt}>
        {choices.map((choice, i) => (
          <Choice key={i} label={choice.label} setFlag={choice.setFlag}>
            {choice.content}
          </Choice>
        ))}
      </ChoiceBlock>
    </section>
  );
}

