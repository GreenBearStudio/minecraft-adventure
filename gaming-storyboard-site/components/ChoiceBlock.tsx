// components/ChoiceBlock.tsx
import {
  useState,
  ReactElement,
  ReactNode,
  isValidElement,
} from "react";
import Choice from "./Choice";
import { useStoryNamespace } from "../context/StoryNamespaceContext";
import { useStoryState } from "../context/StoryStateContext";

type ChoiceProps = {
  label: string;
  setFlag?: string;
  children: ReactElement;
};

type ChoiceData = {
  label: string;
  content: ReactElement;
  setFlag?: string;
};

type Props = {
  prompt: string;
  children: ReactNode;
};

export default function ChoiceBlock({ prompt, children }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const { setNamespacedFlag } = useStoryState();
  const namespace = useStoryNamespace();

  const childArray = Array.isArray(children) ? children : [children];

  const choices: ChoiceData[] = childArray
    .filter((child): child is ReactElement => isValidElement(child))
    .filter((child) => child.type === Choice)
    .map((child) => {
      const props = child.props as ChoiceProps;
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


