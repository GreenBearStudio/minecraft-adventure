// components/UnlockStage.tsx
import { ReactNode } from "react";

type UnlockStageProps = {
  moves?: number;
  solved?: boolean;
  setFlag?: string;
  children: ReactNode;
};

export default function UnlockStage(_props: UnlockStageProps) {
  // TileFlipPuzzle will read props from the element; this never renders directly
  return null;
}

