// components/ChoiceBlock.tsx
import {
  useState,
  ReactElement,
  ReactNode,
  isValidElement,
} from "react";
import { useStoryNamespace } from "../context/StoryNamespaceContext";
import { useStoryState } from "../context/StoryStateContext";

type ChoiceData = {
  label: string;
  content: ReactElement;
  setFlag?: string;
};

type Props = {
  prompt: string;
  children: ReactNode;
};

// Type predicate: ensures child is a ReactElement WITH props
function isChoiceElement(
  child: ReactNode
): child is ReactElement<{ [key: string]: any }> {
  return isValidElement(child) && typeof child.props === "object";
}

export default function ChoiceBlock({ prompt, children }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const { setNamespacedFlag } = useStoryState();
  const namespace = useStoryNamespace();

  // Normalize children into an array
  const childArray = Array.isArray(children) ? children : [children];

  // STEP 1 — Narrow to valid React elements with props
  const validChildren = childArray.filter(isChoiceElement);

  // STEP 2 — Now TypeScript knows child.props exists
  const choices: ChoiceData[] = validChildren
    .filter((child) => child.props["data-choice"] !== undefined)
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
                setNamespacedFlag(namespace, choice.setFlag, true);
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
        <div className="choice-content">
          {choices[selected].content}
        </div>
      )}
    </div>
  );
}

