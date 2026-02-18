// components/PuzzleChoiceBlock.tsx
import {
  useState,
  ReactElement,
  ReactNode,
  isValidElement,
} from "react";
import PuzzleChoice from "./PuzzleChoice";
import { useStoryState } from "../context/StoryStateContext";

type PuzzleChoiceProps = {
  label: string;
  setFlag?: string;
  children: ReactElement;
};

type PuzzleChoiceData = {
  label: string;
  content: ReactElement;
  setFlag?: string;
};

type Props = {
  prompt: string;
  children: ReactNode;
};

export default function PuzzleChoiceBlock({ prompt, children }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const { setFlag } = useStoryState();

  const childArray = Array.isArray(children) ? children : [children];

  const choices: PuzzleChoiceData[] = childArray
    .filter((child): child is ReactElement => isValidElement(child))
    .filter((child) => child.type === PuzzleChoice)
    .map((child) => {
      const props = child.props as PuzzleChoiceProps;
      return {
        label: props.label,
        setFlag: props.setFlag,
        content: props.children,
      };
    });

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
                setFlag(choice.setFlag, true);
              }
            }}
            className={`button ${
              selected === i ? "button-primary" : "button-secondary"
            }`}
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


