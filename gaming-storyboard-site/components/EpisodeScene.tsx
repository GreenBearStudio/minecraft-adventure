import ChoiceBlock from '../components/ChoiceBlock'
import StoryboardMedia from '../components/StoryboardMedia'

type Props = {
  title: string
  prompt: string
  choices: { label: string; content: React.ReactNode }[]
  media: { type: 'image' | 'video' | 'embed'; src: string; alt?: string }[]
}

export default function EpisodeScene({ title, prompt, choices, media }: Props) {
  return (
    <section className="episode-scene">
      <h2>{title}</h2>

      {/* Media block */}
      <StoryboardMedia items={media} />

      {/* Choice block */}
      <ChoiceBlock prompt={prompt} choices={choices} />
    </section>
  )
}

