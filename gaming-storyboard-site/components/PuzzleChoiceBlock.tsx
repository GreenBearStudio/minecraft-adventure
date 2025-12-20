import { useState } from 'react';
import { useStoryState } from '../context/StoryStateContext';

type PuzzleChoice = {
  label: string;
  content: React.ReactNode;
  setFlag?: string; 
};

type PuzzleChoiceBlockProps = {
  prompt: string;
  choices: PuzzleChoice[];
};

export default function PuzzleChoiceBlock({ prompt, choices }: PuzzleChoiceBlockProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const { setFlag } = useStoryState(); 

  return (
    <div className="choice-block">
      <p><strong>{prompt}</strong></p>

      <div className="choice-buttons">
        {choices.map((choice, i) => (
          <button
            key={i}
            onClick={() => {
              setSelected(i);
              if (choice.setFlag) setFlag(choice.setFlag, true); 
            }}
            className={`button ${selected === i ? 'button-primary' : 'button-secondary'}`}
          >
            {choice.label}
          </button>
        ))}
      </div>

      {selected !== null && (
        <div className="choice-content puzzle-center">
          {choices[selected].content}
        </div>
      )}
    </div>
  );
}

