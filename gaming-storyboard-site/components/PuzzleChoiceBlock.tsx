// components/PuzzleChoiceBlock.tsx
import {
  useState,
  ReactElement,
  ReactNode,
  isValidElement,
} from "react";
import { useStoryState } from "../context/StoryStateContext";

type PuzzleChoiceData = {
  label: string;
  content: ReactElement;
  setFlag?: string;
};

type Props = {
  prompt: string;
  children: ReactNode;
};

// Type predicate: ensures child is a ReactElement WITH props
function isPuzzleChoiceElement(
  child: ReactNode
): child is ReactElement<{ [key: string]: any }> {
  return isValidElement(child) && typeof child.props === "object";
}

export default function PuzzleChoiceBlock({ prompt, children }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const { setFlag } = useStoryState();

  // Normalize children into an array
  const childArray = Array.isArray(children) ? children : [children];

  // STEP 1 — Narrow to valid React elements with props
  const validChildren = childArray.filter(isPuzzleChoiceElement);

  // STEP 2 — Extract puzzle choices
  const choices: PuzzleChoiceData[] = validChildren
    .filter((child) => child.props["data-puzzlechoice"] !== undefined)
    .map((child) => ({
      label: child.props["data-label"],
      setFlag: child.props["data-setflag"] || undefined,
      content: child.props.children,
    }));

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

