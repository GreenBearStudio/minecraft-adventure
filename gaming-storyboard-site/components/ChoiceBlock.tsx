import { useState } from "react";
import { useStoryNamespace } from "../context/StoryNamespaceContext";
import { useStoryState } from "../context/StoryStateContext";

type Choice = {
  label: string;
  content: React.ReactNode;
  setFlag?: string;
};

type Props = {
  prompt: string;
  choices: Choice[];
};

export default function ChoiceBlock({ prompt, choices }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const { setNamespacedFlag } = useStoryState();
  const namespace = useStoryNamespace();

  return (
    <div className="choice-block">
      <p><strong>{prompt}</strong></p>

      <div className="choice-buttons">
        {choices.map((choice, i) => (
          <button
            key={i}
            onClick={() => {
              setSelected(i);
              if (choice.setFlag) {
                setNamespacedFlag(namespace, choice.setFlag, true);
              }
            }}
            className={`button ${selected === i ? "button-primary" : "button-secondary"}`}
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
  );
}

