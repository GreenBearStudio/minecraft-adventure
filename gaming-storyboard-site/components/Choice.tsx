// components/Choice.tsx
import { ReactNode } from "react";

type ChoiceProps = {
  label: string;
  setFlag?: string;
  children: ReactNode;
};

export default function Choice({ label, setFlag, children }: ChoiceProps) {
  return (
    <div
      data-choice
      data-label={label}
      data-setflag={setFlag || ""}
      style={{ display: "none" }} // ChoiceBlock reads these, not rendered directly
    >
      {children}
    </div>
  );
}

