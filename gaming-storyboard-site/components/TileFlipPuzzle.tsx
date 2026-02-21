import { useState, useEffect, ReactNode, ReactElement, isValidElement } from "react";
import { useStoryState } from "../context/StoryStateContext";
import { useStoryNamespace } from "../context/StoryNamespaceContext";
import UnlockStage from "./UnlockStage";

type Difficulty = "easy" | "medium" | "hard" | "very_hard";
type Theme = "default" | "snow" | "forest" | "desert";

type UnlockStageProps = {
  moves?: number;
  solved?: boolean;
  setFlag?: string;
  children: ReactElement;
};

interface TileFlipPuzzleProps {
  difficulty?: Difficulty;
  theme?: Theme;
  children?: ReactNode;
}

export default function TileFlipPuzzle({
  difficulty = "medium",
  theme = "default",
  children,
}: TileFlipPuzzleProps) {
  const sizeMap: Record<Difficulty, number> = {
    easy: 2,
    medium: 3,
    hard: 5,
    very_hard: 7,
  };

  const size = sizeMap[difficulty];

  const [grid, setGrid] = useState<number[][]>([]);
  const [moves, setMoves] = useState(0);
  const [firedFlags, setFiredFlags] = useState<Record<string, boolean>>({});

  const { setNamespacedFlag } = useStoryState();
  const namespace = useStoryNamespace();

  useEffect(() => {
    const init = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => Math.round(Math.random()))
    );
    setGrid(init);
    setMoves(0);
    setFiredFlags({});
  }, [size]);

  const flip = (x: number, y: number) => {
    const dirs = [
      [0, 0],
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    const newGrid = grid.map((row) => [...row]);

    dirs.forEach(([dx, dy]) => {
      const nx = x + dx,
        ny = y + dy;
      if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
        newGrid[ny][nx] ^= 1;
      }
    });

    setGrid(newGrid);
    setMoves((m) => m + 1);
  };

  const isSolved =
    grid.length > 0 && grid.every((row) => row.every((cell) => cell === 1));

  const themeStyles: Record<Theme, { active: string; inactive: string }> = {
    default: { active: "gold", inactive: "black" },
    snow: { active: "#aeefff", inactive: "#003366" },
    forest: { active: "#4caf50", inactive: "#1b3d1b" },
    desert: { active: "#f4d35e", inactive: "#8c6d1f" },
  };

  const colors = themeStyles[theme];

  const childArray = Array.isArray(children) ? children : children ? [children] : [];

  const unlockStages: UnlockStageProps[] = childArray
    .filter((child): child is ReactElement => isValidElement(child))
    .filter((child) => child.type === UnlockStage)
    .map((child) => child.props as UnlockStageProps);

  // fire flags when stages become visible
  useEffect(() => {
    unlockStages.forEach((stage) => {
      const shouldShow =
        (stage.moves !== undefined && moves >= Number(stage.moves)) ||
        (stage.solved && isSolved);

      if (shouldShow && stage.setFlag && !firedFlags[stage.setFlag]) {
        const key = stage.setFlag;
        setNamespacedFlag(namespace, key, true);
        setFiredFlags((prev) => ({ ...prev, [key]: true }));
      }
    });
  }, [moves, isSolved, unlockStages, firedFlags, setNamespacedFlag, namespace]);

  return (
    <div className="tile-flip-puzzle">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2rem",
          marginBottom: "0.5rem",
          fontSize: "0.9rem",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span
            style={{
              width: "1rem",
              height: "1rem",
              background: colors.active,
              border: "1px solid #333",
              display: "inline-block",
            }}
          />
          Unlocked Cell
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span
            style={{
              width: "1rem",
              height: "1rem",
              background: colors.inactive,
              border: "1px solid #333",
              display: "inline-block",
            }}
          />
          Inactive
        </div>
      </div>

      <p>
        Moves: {moves} {isSolved && "✅ Solved!"}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${size}, var(--tile-size))`,
          justifyContent: "center",
          margin: "1rem 0",
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              onClick={() => flip(x, y)}
              style={{
                width: "var(--tile-size)",
                height: "var(--tile-size)",
                background: cell ? colors.active : colors.inactive,
                border: "1px solid #333",
                cursor: "pointer",
              }}
            />
          ))
        )}
      </div>

      <p>A click on a cell, switches the states of nearby cells!</p>
      <p>Attempt to unlock all the cells!</p>

      {unlockStages.map((stage, i) => {
        const shouldShow =
          (stage.moves !== undefined && moves >= stage.moves) ||
          (stage.solved && isSolved);

        if (!shouldShow) return null;

        return (
          <div key={i} className="puzzle-solved-content">
            {stage.children}
          </div>
        );
      })}
    </div>
  );
}

