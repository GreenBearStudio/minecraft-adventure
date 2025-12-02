import { useState } from 'react'

type Choice = {
  label: string
  content: React.ReactNode
}

type Props = {
  prompt: string
  choices: Choice[]
}

export default function ChoiceBlock({ prompt, choices }: Props) {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="choice-block">
      <p><strong>{prompt}</strong></p>
      <div className="choice-buttons">
        {choices.map((choice, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`button ${selected === i ? 'button-primary' : 'button-secondary'}`}
          >
            {choice.label}
          </button>
        ))}
      </div>
      {selected !== null && (
        <div className="choice-content">
          {choices[selected].content}
        </div>
      )}
    </div>
  )
}

