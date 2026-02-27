import {
  useState,
  useEffect,
  useCallback,
  ReactNode,
  ReactElement,
  isValidElement,
} from "react";
import { useStoryState } from "../context/StoryStateContext";
import { useStoryNamespace } from "../context/StoryNamespaceContext";
import UnlockStage from "./UnlockStage";

type Difficulty = "easy" | "medium" | "hard";
type Theme = "default" | "snow" | "forest" | "desert";

type UnlockStageProps = {
  moves?: number;
  solved?: boolean;
  setFlag?: string;
  children: ReactElement;
};

interface MazePuzzleProps {
  difficulty?: Difficulty;
  theme?: Theme;
  enableEnemy?: boolean;
  enemySprite?: string;
  openness?: string;
  children?: ReactNode;
}

export default function MazePuzzle({
  difficulty = "medium",
  theme = "default",
  enableEnemy = false,
  enemySprite,
  openness = "0",
  children,
}: MazePuzzleProps) {
  // -------------------------------
  // 1. Difficulty → Maze Size
  // -------------------------------
  const sizeMap: Record<Difficulty, number> = {
    easy: 7,
    medium: 11,
    hard: 17,
  };

  const size = sizeMap[difficulty];

  // Maze grid: 0 = wall, 1 = path
  const [maze, setMaze] = useState<number[][]>([]);
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [exit, setExit] = useState({ x: size - 2, y: size - 2 });
  const [enemy, setEnemy] = useState({ x: 1, y: 1 });
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const [firedFlags, setFiredFlags] = useState<Record<string, boolean>>({});

  const { setNamespacedFlag } = useStoryState();
  const namespace = useStoryNamespace();
  
  const opennessValue = Number(openness);

  const effectiveEnemySprite = enemySprite || "/images/warden.png";
  const playerSprite = "/images/player.png";

  // -------------------------------
  // 2. Maze Generation (Recursive Backtracking)
  // -------------------------------
  const generateMaze = useCallback(() => {
    const grid = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => 0)
    );

    const carve = (x: number, y: number) => {
      const dirs = [
        [2, 0],
        [-2, 0],
        [0, 2],
        [0, -2],
      ].sort(() => Math.random() - 0.5);

      dirs.forEach(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;

        if (
          nx > 0 &&
          nx < size - 1 &&
          ny > 0 &&
          ny < size - 1 &&
          grid[ny][nx] === 0
        ) {
          grid[ny][nx] = 1;
          grid[y + dy / 2][x + dx / 2] = 1;
          carve(nx, ny);
        }
      });
    };

    grid[1][1] = 1;
    carve(1, 1);
    
    if (opennessValue > 0) {
      for (let y = 1; y < size - 1; y++) {
        for (let x = 1; x < size - 1; x++) {
          if (grid[y][x] === 0 && Math.random() < opennessValue) {
            grid[y][x] = 1;
          }
        }
      }
    }

    return grid;
  }, [size]);

  // -------------------------------
  // 3. Restart / Initialize Maze
  // -------------------------------
  const restartMaze = useCallback(() => {
    const m = generateMaze();
    setMaze(m);
    setPlayer({ x: 1, y: 1 });
    setExit({ x: size - 2, y: size - 2 });
    // enemy starts bottom-left-ish
    setEnemy({ x: 1, y: size - 2 });
    setMoves(0);
    setSolved(false);
    setFiredFlags({});
  }, [generateMaze, size]);

  useEffect(() => {
    restartMaze();
  }, [restartMaze]);

  // -------------------------------
  // 4. Enemy Movement Logic
  // -------------------------------
  const moveEnemy = (targetPlayer: { x: number; y: number }) => {
    if (!enableEnemy || solved) return;

    let { x, y } = enemy;

    const dx = Math.sign(targetPlayer.x - x);
    const dy = Math.sign(targetPlayer.y - y);

    // Try horizontal move first
    if (dx !== 0 && maze[y] && maze[y][x + dx] === 1) {
      x += dx;
    }
    // Otherwise try vertical move
    else if (dy !== 0 && maze[y + dy] && maze[y + dy][x] === 1) {
      y += dy;
    }

    const newEnemy = { x, y };
    setEnemy(newEnemy);

    // Collision check
    if (newEnemy.x === targetPlayer.x && newEnemy.y === targetPlayer.y) {
      restartMaze();
    }
  };

  // -------------------------------
  // 5. Player Movement Logic
  // -------------------------------
  const tryMove = (dx: number, dy: number) => {
    if (solved) return;

    const nx = player.x + dx;
    const ny = player.y + dy;

    if (maze[ny] && maze[ny][nx] === 1) {
      const newPlayer = { x: nx, y: ny };
      setPlayer(newPlayer);
      setMoves((m) => m + 1);

      // Enemy moves after player
      moveEnemy(newPlayer);

      if (nx === exit.x && ny === exit.y) {
        setSolved(true);
      }
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w") tryMove(0, -1);
      if (e.key === "ArrowDown" || e.key === "s") tryMove(0, 1);
      if (e.key === "ArrowLeft" || e.key === "a") tryMove(-1, 0);
      if (e.key === "ArrowRight" || e.key === "d") tryMove(1, 0);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  // -------------------------------
  // 6. Theme Colors
  // -------------------------------
  const themeStyles: Record<
    Theme,
    { wall: string; path: string; player: string; exit: string; enemy: string }
  > = {
    default: {
      wall: "#222",
      path: "#e0c060",
      player: "gold",
      exit: "#00cc66",
      enemy: "#ff4444",
    },
    snow: {
      wall: "#003366",
      path: "#aeefff",
      player: "#ffffff",
      exit: "#66ffcc",
      enemy: "#ff6666",
    },
    forest: {
      wall: "#1b3d1b",
      path: "#4caf50",
      player: "#a2ff9e",
      exit: "#00ff88",
      enemy: "#ff5555",
    },
    desert: {
      wall: "#8c6d1f",
      path: "#f4d35e",
      player: "#ffe08a",
      exit: "#ffb347",
      enemy: "#ff6666",
    },
  };

  const colors = themeStyles[theme];

  // -------------------------------
  // 7. UnlockStages (same pattern as TileFlipPuzzle)
  // -------------------------------
  const childArray = Array.isArray(children) ? children : children ? [children] : [];

  const unlockStages: UnlockStageProps[] = childArray
    .filter((child): child is ReactElement => isValidElement(child))
    .filter((child) => child.type === UnlockStage)
    .map((child) => child.props as UnlockStageProps);

  useEffect(() => {
    unlockStages.forEach((stage) => {
      const shouldShow =
        (stage.moves !== undefined && moves >= Number(stage.moves)) ||
        (stage.solved && solved);

      if (shouldShow && stage.setFlag && !firedFlags[stage.setFlag]) {
        const key = stage.setFlag;
        setNamespacedFlag(namespace, key, true);
        setFiredFlags((prev) => ({ ...prev, [key]: true }));
      }
    });
  }, [moves, solved, unlockStages, firedFlags, setNamespacedFlag, namespace]);

  // -------------------------------
  // 8. Render Maze
  // -------------------------------
  return (
    <div className="maze-puzzle">
      <p>
        Moves: {moves} {solved && "✅ Escaped!"}
      </p>

      {enableEnemy && (
        <p style={{ color: "#cc4444", fontSize: "0.9rem" }}>
          An enemy is chasing you! If it catches you, the maze restarts.
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${size}, var(--tile-size))`,
          justifyContent: "center",
          margin: "1rem 0",
        }}
      >
        {maze.map((row, y) =>
          row.map((cell, x) => {
            const isPlayer = x === player.x && y === player.y;
            const isExit = x === exit.x && y === exit.y;
            const isEnemy = enableEnemy && x === enemy.x && y === enemy.y;

            const isAdjacent =
              Math.abs(x - player.x) + Math.abs(y - player.y) === 1 &&
              maze[y][x] === 1;

            return (
              <div
                key={`${x}-${y}`}
                onClick={() => {
                  if (isAdjacent) {
                    const dx = x - player.x;
                    const dy = y - player.y;
                    tryMove(dx, dy);
                  }
                }}
                style={{
                  width: "var(--tile-size)",
                  height: "var(--tile-size)",
                  background: cell === 1 ? colors.path : colors.wall,
                  border: "1px solid #333",
                  position: "relative",
                  outline: isAdjacent ? "2px solid yellow" : "none",
                  outlineOffset: "-2px",
                  cursor: isAdjacent ? "pointer" : "default",
                }}
              >
                {isExit && (
                  <span
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      color: "black",
                      fontWeight: "bold",
                      fontSize: "0.8rem",
                      pointerEvents: "none",
                    }}
                  >
                    EXIT
                  </span>
                )}

                {isPlayer && (
                  <img
                    src={playerSprite}
                    alt="player"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      pointerEvents: "none",
                    }}
                  />
                )}

                {isEnemy && (
                  <img
                    src={effectiveEnemySprite}
                    alt="enemy"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      pointerEvents: "none",
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      <p>
        Click on adjacent cells or use arrow keys / WASD to navigate the maze.
        {enableEnemy && " Don’t let the enemy catch you!"}
      </p>

      {unlockStages.map((stage, i) => {
        const shouldShow =
          (stage.moves !== undefined && moves >= stage.moves) ||
          (stage.solved && solved);

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

