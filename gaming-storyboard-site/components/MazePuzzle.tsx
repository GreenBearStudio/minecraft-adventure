import {
  useState,
  useEffect,
  useCallback,
  ReactNode,
  ReactElement,
  isValidElement,
  useRef,
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
  enableEnemySpawn?: boolean;
  enemySpawnSprite?: string;
  openness?: string;
  enemySpeed?: string;
  enemyNumber?: string;
  enemySpawnNumber?: string;
  children?: ReactNode;
}

export default function MazePuzzle({
  difficulty = "medium",
  theme = "default",
  enableEnemy = false,
  enemySprite,
  enableEnemySpawn = false,
  enemySpawnSprite,
  openness = "0",
  enemySpeed = "1",
  enemyNumber = "1",
  enemySpawnNumber = "0",
  children,
}: MazePuzzleProps) {
  const sizeMap: Record<Difficulty, number> = {
    easy: 7,
    medium: 11,
    hard: 17,
  };

  const size = sizeMap[difficulty];

  const [maze, setMaze] = useState<number[][]>([]);
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [exit, setExit] = useState({ x: size - 2, y: size - 2 });
  const [enemies, setEnemies] = useState<{ x: number; y: number }[]>([]);

  // FIXED: spawner type includes hasSpawned
  const [spawners, setSpawners] = useState<
    { x: number; y: number; hasSpawned: boolean }[]
  >([]);

  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const [firedFlags, setFiredFlags] = useState<Record<string, boolean>>({});

  // Flash system
  type Flash = { id: string; x: number; y: number; expiresAt: number };
  const FLASH_DURATION = 500;
  const [flashes, setFlashes] = useState<Flash[]>([]);
  const flashTimeouts = useRef<Record<string, number>>({});

  // Sound effect
  const spawnSoundRef = useRef<HTMLAudioElement | null>(null);

  const { setNamespacedFlag } = useStoryState();
  const namespace = useStoryNamespace();

  const opennessValue = Number(openness);
  const enemySpeedValue = Number(enemySpeed);
  const enemyNumberValue = Number(enemyNumber);
  const enemySpawnNumberValue = Number(enemySpawnNumber);

  const effectiveEnemySprite = enemySprite || "/images/warden.png";
  const effectiveEnemySpawnSprite =
    enemySpawnSprite || "/images/sculk_shrieker.png";
  const playerSprite = "/images/player.png";

  // -------------------------------
  // Maze Generation
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
  // Restart Maze
  // -------------------------------
  const restartMaze = useCallback(() => {
    const m = generateMaze();
    setMaze(m);

    const playerStart = { x: 1, y: 1 };
    const exitPos = { x: size - 2, y: size - 2 };

    setPlayer(playerStart);
    setExit(exitPos);

    const walkable = getWalkableTiles(m);
    const enemies = pickRandomEnemies(walkable, enemyNumberValue, [
      playerStart,
      exitPos,
    ]);
    setEnemies(enemies);

    if (enableEnemySpawn) {
      const spawnerTiles = pickRandomEnemies(
        walkable,
        enemySpawnNumberValue,
        [playerStart, exitPos]
      );
      setSpawners(
        spawnerTiles.map((s) => ({
          x: s.x,
          y: s.y,
          hasSpawned: false,
        }))
      );
    }

    setMoves(0);
    setSolved(false);
  }, [size, enemyNumberValue, generateMaze]);

  useEffect(() => {
  restartMaze();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  // -------------------------------
  const getWalkableTiles = (maze: number[][]) => {
    const tiles: { x: number; y: number }[] = [];

    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[0].length; x++) {
        if (maze[y][x] === 1) {
          tiles.push({ x, y });
        }
      }
    }

    return tiles;
  };

  const isPlayerNear = (px: number, py: number, sx: number, sy: number) => {
    return Math.abs(px - sx) + Math.abs(py - sy) <= 3;
  };

  const pickRandomEnemies = (
    tiles: { x: number; y: number }[],
    count: number,
    forbidden: { x: number; y: number }[]
  ) => {
    const allowed = tiles.filter(
      (t) => !forbidden.some((f) => f.x === t.x && f.y === t.y)
    );

    const enemies: { x: number; y: number }[] = [];

    for (let i = 0; i < count; i++) {
      if (allowed.length === 0) break;

      const idx = Math.floor(Math.random() * allowed.length);
      enemies.push(allowed[idx]);
      allowed.splice(idx, 1);
    }

    return enemies;
  };

  // -------------------------------
  // Spawn enemy + flash + sound
  // -------------------------------
  const spawnAt = (sx: number, sy: number) => {
    setEnemies((prev) => [...prev, { x: sx, y: sy }]);

    if (spawnSoundRef.current) {
      spawnSoundRef.current.currentTime = 0;
      spawnSoundRef.current.play().catch(() => {});
    }

    const id =
      `${sx}-${sy}-${Date.now()}-` +
      Math.random().toString(36).slice(2, 6);
    const expiresAt = Date.now() + FLASH_DURATION;
    const flash: Flash = { id, x: sx, y: sy, expiresAt };

    setFlashes((prev) => [...prev, flash]);

    const t = window.setTimeout(() => {
      setFlashes((prev) => prev.filter((f) => f.id !== id));
      delete flashTimeouts.current[id];
    }, FLASH_DURATION);

    flashTimeouts.current[id] = t;
  };

  useEffect(() => {
    return () => {
      Object.values(flashTimeouts.current).forEach((t) => clearTimeout(t));
      flashTimeouts.current = {};
    };
  }, []);

  // -------------------------------
  // Enemy Movement
  // -------------------------------
  const moveEnemies = (targetPlayer: { x: number; y: number }) => {
    if (!enableEnemy || solved) return;

    setEnemies((prevEnemies) => {
      const updated = prevEnemies.map((enemy) => {
        let { x, y } = enemy;

        let dx = Math.sign(targetPlayer.x - x);
        let dy = Math.sign(targetPlayer.y - y);

        if (!isPlayerNear(targetPlayer.x, targetPlayer.y, x, y)) {
          dx = Math.random() < 0.5 ? -dx : dx;
          dy = Math.random() < 0.5 ? -dy : dy;
        }

        if (dx !== 0 && maze[y] && maze[y][x + dx] === 1) {
          x += dx;
        } else if (dy !== 0 && maze[y + dy] && maze[y + dy][x] === 1) {
          y += dy;
        }

        return { x, y };
      });

      if (
        updated.some(
          (e) => e.x === targetPlayer.x && e.y === targetPlayer.y
        )
      ) {
        restartMaze();
      }

      return updated;
    });
  };

  // -------------------------------
  // Player Movement
  // -------------------------------
  const tryMove = (dx: number, dy: number) => {
  if (solved) return;

  const nx = player.x + dx;
  const ny = player.y + dy;

  if (maze[ny] && maze[ny][nx] === 1) {
    const newPlayer = { x: nx, y: ny };
    setPlayer(newPlayer);

    setSpawners(prev =>
      prev.map(spawner => {
        const key = `${spawner.x},${spawner.y}`;

        console.log("Spawner BEFORE:", spawner);

        if (spawner.hasSpawned) {
          console.log("Already spawned → returning unchanged");
          return spawner;
        }

        if (isPlayerNear(newPlayer.x, newPlayer.y, spawner.x, spawner.y)) {
          console.log("MARKING SPAWN at", key);
          const updated = { ...spawner, hasSpawned: true };
          console.log("Spawner AFTER:", updated);
          return updated;
        }

        console.log("No spawn → returning unchanged");
        return spawner;
      })
    );

    setMoves(m => {
      const newMoves = m + 1;
      if (newMoves % enemySpeedValue === 0) {
        moveEnemies(newPlayer);
      }
      return newMoves;
    });

    if (nx === exit.x && ny === exit.y) {
      setSolved(true);
    }
  }
};
  
  useEffect(() => {
  console.log("RESTART MAZE TRIGGERED");
}, [maze]);

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
  const prevSpawnersRef = useRef<{ x: number; y: number; hasSpawned: boolean }[] | null>(null);

useEffect(() => {
  const prev = prevSpawnersRef.current;
  if (!prev) {
    prevSpawnersRef.current = spawners;
    return;
  }

  spawners.forEach(spawner => {
    const before = prev.find(
      p => p.x === spawner.x && p.y === spawner.y
    );
    if (before && !before.hasSpawned && spawner.hasSpawned) {
      // just flipped false -> true: do the side effect once
      spawnAt(spawner.x, spawner.y);
    }
  });

  prevSpawnersRef.current = spawners;
}, [spawners]);

  // -------------------------------
  // Theme Colors
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
  // Unlock Stages
  // -------------------------------
  const childArray = Array.isArray(children)
    ? children
    : children
    ? [children]
    : [];

  const unlockStages: UnlockStageProps[] = childArray
    .filter((child): child is ReactElement => isValidElement(child))
    .filter((child) => child.type === UnlockStage)
    .map((child) => child.props as UnlockStageProps);

  useEffect(() => {
    unlockStages.forEach((stage) => {
      const shouldShow =
        (stage.moves !== undefined &&
          moves >= Number(stage.moves)) ||
        (stage.solved && solved);

      if (shouldShow && stage.setFlag && !firedFlags[stage.setFlag]) {
        const key = stage.setFlag;
        setNamespacedFlag(namespace, key, true);
        setFiredFlags((prev) => ({ ...prev, [key]: true }));
      }
    });
  }, [
    moves,
    solved,
    unlockStages,
    firedFlags,
    setNamespacedFlag,
    namespace,
  ]);

  // -------------------------------
  // Render Maze
  // -------------------------------
  return (
    <div className="maze-puzzle">
      <audio
        ref={spawnSoundRef}
        src="/sounds/Sculk_shrieker_shriek5.mp3"
        preload="auto"
      />

      <p>
        Moves: {moves} {solved && "✅ Escaped!"}
      </p>

      {enableEnemy && !enableEnemySpawn && (
        <p style={{ color: "#cc4444", fontSize: "0.9rem" }}>
          An enemy is chasing you! If it catches you, the maze restarts.
        </p>
      )}
      {enableEnemySpawn && (
        <p style={{ color: "#cc4444", fontSize: "0.9rem" }}>
          Careful where you go! Enemies can appear out there! If enemy
          catches you, the maze restarts.
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
            const isEnemy =
              enableEnemy &&
              enemies.some((e) => e.x === x && e.y === y);

            const spawnerObj = enableEnemySpawn
              ? spawners.find((s) => s.x === x && s.y === y)
              : null;

            const isSpawner = !!spawnerObj;
            const isUsedSpawner = spawnerObj?.hasSpawned;

            const tileFlashes = flashes.filter(
              (f) => f.x === x && f.y === y
            );

            const isAdjacent =
              Math.abs(x - player.x) +
                Math.abs(y - player.y) ===
                1 && maze[y][x] === 1;

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
                  background:
                    cell === 1 ? colors.path : colors.wall,
                  border: "1px solid #333",
                  position: "relative",
                  outline: isAdjacent
                    ? "2px solid yellow"
                    : "none",
                  outlineOffset: "-2px",
                  cursor: isAdjacent ? "pointer" : "default",
                }}
              >
                {isSpawner && (
                  <img
                    src={effectiveEnemySpawnSprite}
                    alt="enemySpawn"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      pointerEvents: "none",
                      opacity: isUsedSpawner ? 0.35 : 1,
                      filter: isUsedSpawner
                        ? "grayscale(100%)"
                        : "none",
                    }}
                  />
                )}

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

{/* render one overlay per flash (they will overlap if multiple) */}
{tileFlashes.map((f) => (
  <div
    key={f.id}
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(255, 0, 0, 0.65)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: 700,
      fontSize: "0.8rem",
      pointerEvents: "none",
      animation: "spawnerPop 0.45s ease-out",
    }}
  >
    Enemy!
  </div>
))}
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

