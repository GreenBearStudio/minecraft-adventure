// components/PuzzleChoice.tsx
import { ReactNode } from "react";

type PuzzleChoiceProps = {
  label: string;
  setFlag?: string;
  children: ReactNode;
};

export default function PuzzleChoice({ label, setFlag, children }: PuzzleChoiceProps) {
  return (
    <div
      data-puzzlechoice
      data-label={label}
      data-setflag={setFlag || ""}
      style={{ display: "none" }} // extracted by PuzzleChoiceBlock
    >
      {children}
    </div>
  );
}

