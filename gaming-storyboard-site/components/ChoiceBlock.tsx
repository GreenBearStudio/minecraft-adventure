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
    <div style={{ margin: '1rem 0', padding: '1rem', border: '1px solid #ccc' }}>
      <p><strong>{prompt}</strong></p>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        {choices.map((choice, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: '1px solid #888',
              background: selected === i ? '#444' : '#eee',
              color: selected === i ? '#fff' : '#000',
              cursor: 'pointer'
            }}
          >
            {choice.label}
          </button>
        ))}
      </div>
      {selected !== null && (
        <div style={{ marginTop: '1rem' }}>
          {choices[selected].content}
        </div>
      )}
    </div>
  )
}

